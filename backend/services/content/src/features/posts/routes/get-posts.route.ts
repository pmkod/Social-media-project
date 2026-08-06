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
			description: "List of posts with medias",
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
				select: {
					id: true,
					authorId: true,
					text: true,
					likesCount: true,
					commentsCount: true,
					createdAt: true,
					updatedAt: true,
					medias: {
						select: {
							id: true,
							postId: true,
							position: true,
							mediaType: true,
							createdAt: true,
							lowQualityFileId: true,
							lowQualityFile: {
								select: {
									id: true,
									mimeType: true,
									filename: true,
									createdAt: true,
								},
							},
							highQualityFileId: true,
							highQualityFile: {
								select: {
									id: true,
									mimeType: true,
									filename: true,
									createdAt: true,
								},
							},
						},
						orderBy: { position: "asc" },
					},
					comments: {
						take: 2,
						orderBy: { createdAt: "desc" },
						select: {
							id: true,
							postId: true,
							authorId: true,
							content: true,
							likesCount: true,
							createdAt: true,
							updatedAt: true,
						},
					},
				},
			}),
			prisma.post.count({ where }),
		]);

		return c.json({
			posts,
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
