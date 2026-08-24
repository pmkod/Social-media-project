import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import type { Prisma } from "@/generated/prisma/client";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";
import { ProfileMediaFileResponseBody } from "../user.validation-schemas";

const FollowSuggestionsResponseBody = z.object({
	users: z.array(
		z.object({
			id: z.string(),
			username: z.string(),
			fullName: z.string().nullable(),
			lowQualityProfilePictureFile: ProfileMediaFileResponseBody,
			bestQualityProfilePictureFile: ProfileMediaFileResponseBody,
			isFollowedByAuthenticatedUser: z.boolean(),
		}),
	),
	pagination: z.object({
		nextCursor: z
			.object({
				id: z.string(),
				createdAt: z.string(),
				followersCount: z.number(),
			})
			.nullable(),
		hasNextPage: z.boolean(),
		limit: z.number(),
	}),
});

const routeDef = createRoute({
	method: "get",
	path: "/users/me/follow-suggestions",
	summary: "Get follow suggestions for the authenticated user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			cursorFollowersCount: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Follow suggestions",
			content: {
				"application/json": {
					schema: FollowSuggestionsResponseBody,
				},
			},
		},
	},
});

const getFollowSuggestionsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) {
			throw new Error("Unauthorized");
		}

		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);
		const cursorDate = query.cursorCreatedAt
			? new Date(query.cursorCreatedAt)
			: null;
		const cursorFollowersCount = query.cursorFollowersCount
			? Number.parseInt(query.cursorFollowersCount, 10)
			: null;
		const hasValidCursor =
			cursorDate !== null &&
			!Number.isNaN(cursorDate.getTime()) &&
			cursorFollowersCount !== null &&
			!Number.isNaN(cursorFollowersCount) &&
			Boolean(query.cursorId);
		const cursorCondition: Prisma.UserWhereInput | undefined = hasValidCursor
			? {
					OR: [
						{ followersCount: { lt: cursorFollowersCount } },
						{
							followersCount: cursorFollowersCount,
							createdAt: { lt: cursorDate },
						},
						{
							followersCount: cursorFollowersCount,
							createdAt: cursorDate,
							id: { lt: query.cursorId },
						},
					],
				}
			: undefined;

		// Find user IDs that the authenticated user is already following
		const following = await prisma.follow.findMany({
			where: { followerId: authenticatedUser.id },
			select: { followingId: true },
		});
		const followingIds = following.map((f) => f.followingId);
		const blocks = await prisma.block.findMany({
			where: {
				OR: [
					{ blockerId: authenticatedUser.id },
					{ blockedId: authenticatedUser.id },
				],
			},
			select: { blockerId: true, blockedId: true },
		});
		const blockRelationshipIds = blocks.map((block) =>
			block.blockerId === authenticatedUser.id
				? block.blockedId
				: block.blockerId,
		);

		// Exclude authenticated user and already followed users
		const excludedIds = [
			authenticatedUser.id,
			...followingIds,
			...blockRelationshipIds,
		];

		const candidates = await prisma.user.findMany({
			where: {
				id: { notIn: excludedIds },
				active: true,
				...cursorCondition,
			},
			orderBy: [
				{ followersCount: "desc" },
				{ createdAt: "desc" },
				{ id: "desc" },
			],
			take: limit + 1,
			select: {
				id: true,
				username: true,
				fullName: true,
				followersCount: true,
				createdAt: true,
				lowQualityProfilePictureFile: { select: { id: true, filename: true } },
				bestQualityProfilePictureFile: { select: { id: true, filename: true } },
			},
		});

		const hasNextPage = candidates.length > limit;
		const usersToSend = hasNextPage ? candidates.slice(0, limit) : candidates;
		const lastUser = usersToSend.at(-1);

		const users = usersToSend.map(({ followersCount, createdAt, ...user }) => ({
			...user,
			isFollowedByAuthenticatedUser: false,
		}));

		return c.json(
			{
				users,
				pagination: {
					nextCursor:
						hasNextPage && lastUser
							? {
									id: lastUser.id,
									createdAt: lastUser.createdAt.toISOString(),
									followersCount: lastUser.followersCount,
								}
							: null,
					hasNextPage,
					limit,
				},
			},
			HttpStatus.OK.code,
		);
	},
});

export { getFollowSuggestionsRoute };
