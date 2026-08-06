import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { CommentsRoutesTag } from "../comments.constants";

const commentMediaSelect = {
	id: true,
	commentId: true,
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
} as const;

const routeDef = createRoute({
	method: "get",
	path: "/posts/{postId}/comments",
	summary: "Get comments for a post",
	tags: [CommentsRoutesTag],
	request: {
		params: z.object({
			postId: z.string(),
		}),
		query: z.object({
			page: z.string().optional().default("1"),
			limit: z.string().optional().default("20"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "List of comments",
		},
	},
});

const getCommentsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { postId } = c.req.valid("param");
		const query = c.req.valid("query");
		const page = Number.parseInt(query.page, 10) || 1;
		const limit = Number.parseInt(query.limit, 10) || 20;
		const skip = (page - 1) * limit;

		const [comments, total] = await Promise.all([
			prisma.comment.findMany({
				where: { postId },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
				select: {
					id: true,
					postId: true,
					authorId: true,
					content: true,
					createdAt: true,
					updatedAt: true,
					medias: {
						select: commentMediaSelect,
						orderBy: { position: "asc" },
					},
					_count: {
						select: { commentLikes: true },
					},
				},
			}),
			prisma.comment.count({ where: { postId } }),
		]);

		return c.json({
			data: comments,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	},
});

export { getCommentsRoute };
