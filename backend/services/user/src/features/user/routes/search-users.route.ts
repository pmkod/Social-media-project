import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import type { Prisma } from "@/generated/prisma/client";
import { UserRoutesTag } from "../user.constants";
import { ProfileMediaFileResponseBody } from "../user.validation-schemas";

const SearchUsersResponseBody = z.object({
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
	path: "/users",
	summary: "Search users with cursor pagination",
	tags: [UserRoutesTag],
	request: {
		query: z.object({
			q: z.string().trim().min(1).max(100),
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			cursorFollowersCount: z.string().optional(),
			limit: z.string().optional().default("5"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Users matching the search query",
			content: {
				"application/json": { schema: SearchUsersResponseBody },
			},
		},
	},
});

const searchUsersRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");
		const search = query.q.replace(/^@/, "").trim();
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 5, 1),
			50,
		);
		if (!search) {
			return c.json({
				users: [],
				pagination: { nextCursor: null, hasNextPage: false, limit },
			});
		}
		const authenticatedUserId = c.get("authenticatedUser")?.id;

		const blocks = authenticatedUserId
			? await prisma.block.findMany({
					where: {
						OR: [
							{ blockerId: authenticatedUserId },
							{ blockedId: authenticatedUserId },
						],
					},
					select: { blockerId: true, blockedId: true },
				})
			: [];
		const hiddenUserIds = [
			...(authenticatedUserId ? [authenticatedUserId] : []),
			...blocks.map((block) =>
				block.blockerId === authenticatedUserId
					? block.blockedId
					: block.blockerId,
			),
		];

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

		const candidates = await prisma.user.findMany({
			where: {
				active: true,
				...(hiddenUserIds.length > 0 ? { id: { notIn: hiddenUserIds } } : {}),
				AND: [
					{
						OR: [
							{ username: { contains: search, mode: "insensitive" } },
							{ fullName: { contains: search, mode: "insensitive" } },
						],
					},
					...(cursorCondition ? [cursorCondition] : []),
				],
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
				lowQualityProfilePictureFile: {
					select: { id: true, filename: true },
				},
				bestQualityProfilePictureFile: {
					select: { id: true, filename: true },
				},
			},
		});

		const hasNextPage = candidates.length > limit;
		const items = hasNextPage ? candidates.slice(0, limit) : candidates;
		const lastItem = items.at(-1);
		const followedUserIds = authenticatedUserId
			? new Set(
					(
						await prisma.follow.findMany({
							where: {
								followerId: authenticatedUserId,
								followingId: { in: items.map((user) => user.id) },
							},
							select: { followingId: true },
						})
					).map((follow) => follow.followingId),
				)
			: new Set<string>();

		return c.json({
			users: items.map(({ followersCount, createdAt, ...user }) => ({
				...user,
				isFollowedByAuthenticatedUser: followedUserIds.has(user.id),
			})),
			pagination: {
				nextCursor:
					hasNextPage && lastItem
						? {
								id: lastItem.id,
								createdAt: lastItem.createdAt.toISOString(),
								followersCount: lastItem.followersCount,
							}
						: null,
				hasNextPage,
				limit,
			},
		});
	},
});

export { searchUsersRoute };
