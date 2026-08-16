import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { PostsRoutesTag } from "../posts.constants";
import { getPostList } from "../services/get-post-list.service";

const routeDef = createRoute({
	method: "get",
	path: "/posts/users/{userId}/likes",
	summary: "Get posts liked by a user",
	tags: [PostsRoutesTag],
	request: {
		params: z.object({ userId: z.string() }),
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Posts liked by the user" },
	},
});

const getUserLikedPostsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);
		return c.json(
			await getPostList({
				where: { postLikes: { some: { authorId: userId } } },
				cursorId: query.cursorId,
				cursorCreatedAt: query.cursorCreatedAt,
				limit,
				authenticatedUserId: c.req.header("X-Authenticated-User-Id"),
			}),
		);
	},
});

export { getUserLikedPostsRoute };
