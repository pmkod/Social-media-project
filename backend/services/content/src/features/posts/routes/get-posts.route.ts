import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "get",
	path: "/posts",
	summary: "Get list of posts with pagination and counts",
	tags: [PostsRoutesTag],
	request: {
		query: z.object({
			authorId: z.string().optional(),
			page: z.string().optional().default("1"),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "List of posts",
		},
	},
});

const getPostsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");
		const page = Number.parseInt(query.page, 10) || 1;
		const limit = Number.parseInt(query.limit, 10) || 10;
		const skip = (page - 1) * limit;

		const where = query.authorId ? { authorId: query.authorId } : {};

		const [posts, total] = await Promise.all([
			prisma.post.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
				include: {
					_count: {
						select: {
							comments: true,
							postLikes: true,
						},
					},
				},
			}),
			prisma.post.count({ where }),
		]);

		return c.json({
			data: posts,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	},
});

export { getPostsRoute };
