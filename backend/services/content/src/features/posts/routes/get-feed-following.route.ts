import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { PostsRoutesTag } from "../posts.constants";
import { getPostList } from "../services/get-post-list.service";

const routeDef = createRoute({
	method: "get",
	path: "/feed/following",
	summary: "Get following feed with cursor pagination and counts",
	tags: [PostsRoutesTag],
	request: {
		query: z.object({
			authorId: z.string().optional(),
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description:
				"List of posts from following feed with medias, authors and cursor pagination metadata",
		},
	},
});

const getFeedFollowingRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;
		const followingIds = authenticatedUserId
			? await userServiceClient.fetchFollowingIds(authenticatedUserId)
			: [];
		const feedAuthorIds = authenticatedUserId
			? [authenticatedUserId, ...followingIds]
			: [];

		return c.json(
			await getPostList({
				where: query.authorId
					? { authorId: query.authorId }
					: { authorId: { in: feedAuthorIds } },
				cursorId: query.cursorId,
				cursorCreatedAt: query.cursorCreatedAt,
				limit,
				authenticatedUserId,
			}),
		);
	},
});

export { getFeedFollowingRoute };
