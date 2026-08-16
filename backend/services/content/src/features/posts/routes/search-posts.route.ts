import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { PostsRoutesTag } from "../posts.constants";
import { getPostList } from "../services/get-post-list.service";

const routeDef = createRoute({
	method: "get",
	path: "/posts/search",
	summary: "Search all posts with cursor pagination",
	tags: [PostsRoutesTag],
	request: {
		query: z.object({
			q: z.string().optional().default(""),
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Posts matching the search query",
		},
	},
});

const searchPostsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");
		const search = query.q.trim();
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);

		return c.json(
			await getPostList({
				where: search
					? { text: { contains: search, mode: "insensitive" } }
					: undefined,
				cursorId: query.cursorId,
				cursorCreatedAt: query.cursorCreatedAt,
				limit,
				authenticatedUserId: c.req.header("X-Authenticated-User-Id"),
			}),
		);
	},
});

export { searchPostsRoute };
