import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import {
	profileMediaSelect,
	serializeProfileMedia,
} from "../services/profile-media.service";
import { UserRoutesTag } from "../user.constants";
import { ProfileMediaFileResponseBody } from "../user.validation-schemas";

const FollowSuggestionItem = z.object({
	id: z.string(),
	username: z.string(),
	name: z.string(),
	handle: z.string(),
	fullName: z.string().nullable(),
	lowQualityProfilePictureFile: ProfileMediaFileResponseBody,
	bestQualityProfilePictureFile: ProfileMediaFileResponseBody,
	lowQualityCoverPictureFile: ProfileMediaFileResponseBody,
	bestQualityCoverPictureFile: ProfileMediaFileResponseBody,
	bio: z.string().nullable(),
	followersCount: z.number(),
	followingCount: z.number(),
	postCount: z.number(),
	isFollowedByAuthenticatedUser: z.boolean(),
});

const FollowSuggestionsResponseBody = z.object({
	users: z.array(FollowSuggestionItem),
});

const routeDef = createRoute({
	method: "get",
	path: "/users/me/follow-suggestions",
	summary: "Get follow suggestions for the authenticated user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
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
			},
			orderBy: [{ followersCount: "desc" }, { createdAt: "desc" }],
			take: limit,
			select: {
				id: true,
				username: true,
				fullName: true,
				...profileMediaSelect,
				bio: true,
				followersCount: true,
				followingCount: true,
				postCount: true,
			},
		});

		const users = candidates.map((user) => {
			const name = user.fullName || user.username;
			const handle = `@${user.username}`;
			return {
				...serializeProfileMedia(user),
				id: user.id,
				username: user.username,
				name,
				handle,
				fullName: user.fullName,
				bio: user.bio,
				followersCount: user.followersCount,
				followingCount: user.followingCount,
				postCount: user.postCount,
				isFollowedByAuthenticatedUser: followingIds.includes(user.id),
			};
		});

		return c.json({ users });
	},
});

export { getFollowSuggestionsRoute };
