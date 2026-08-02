import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { Configurations } from "@/core/configurations";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { PostsRoutesTag } from "../posts.constants";

const getFilePublicUrl = (filename?: string | null): string => {
	if (!filename) return "";
	const publicUrl =
		Configurations.storage.s3.publicUrl ||
		`${Configurations.storage.s3.endpoint}/${Configurations.storage.s3.bucket}`;
	return `${publicUrl}/${filename}`;
};

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
					content: true,
					createdAt: true,
					updatedAt: true,
					medias: {
						select: {
							id: true,
							position: true,
							mediaType: true,
							lowQualityFile: {
								select: {
									id: true,
									mimeType: true,
									filename: true,
								},
							},
							highQualityFile: {
								select: {
									id: true,
									mimeType: true,
									filename: true,
								},
							},
						},
						orderBy: { position: "asc" },
					},
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
			data: posts.map((post) => {
				const { content, medias, ...rest } = post;

				const formattedMedias = (medias || []).map((m) => ({
					id: m.id,
					position: m.position,
					mediaType: m.mediaType,
					lowQualityUrl: getFilePublicUrl(m.lowQualityFile?.filename),
					highQualityUrl: getFilePublicUrl(m.highQualityFile?.filename),
					lowQualityFile: m.lowQualityFile,
					highQualityFile: m.highQualityFile,
				}));

				return {
					...rest,
					text: content,
					medias: formattedMedias,
					mediaUrls: formattedMedias.map((m) => m.lowQualityUrl),
				};
			}),
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
