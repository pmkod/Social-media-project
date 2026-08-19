import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "get",
	path: "/comments/{commentId}/replies",
	summary: "Get replies to a comment",
	tags: [CommentsRoutesTag],
	request: {
		params: z.object({ commentId: z.string() }),
		query: z.object({
			page: z.string().optional().default("1"),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Paginated comment replies" },
	},
});

const getCommentRepliesRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { commentId } = c.req.valid("param");
		const query = c.req.valid("query");
		const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);
		const parent = await prisma.comment.findUnique({
			where: { id: commentId },
			select: { id: true, parentId: true },
		});
		if (!parent) {
			return c.json({ error: "Comment not found" }, HttpStatus.NOT_FOUND.code);
		}

		const parentId = parent.parentId ?? parent.id;
		const [replies, total] = await Promise.all([
			prisma.comment.findMany({
				where: { parentId },
				orderBy: { createdAt: "asc" },
				skip: (page - 1) * limit,
				take: limit,
				select: {
					id: true,
					postId: true,
					authorId: true,
					parentId: true,
					content: true,
					likesCount: true,
					repliesCount: true,
					createdAt: true,
					updatedAt: true,
				},
			}),
			prisma.comment.count({ where: { parentId } }),
		]);

		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;
		const [authorsMap, likedCommentIds] = await Promise.all([
			userServiceClient.fetchAuthorsBatch(
				replies.map((reply) => reply.authorId),
			),
			(async () => {
				if (!authenticatedUserId || replies.length === 0)
					return new Set<string>();
				const likes = await prisma.commentLike.findMany({
					where: {
						authorId: authenticatedUserId,
						commentId: { in: replies.map((reply) => reply.id) },
					},
					select: { commentId: true },
				});
				return new Set(likes.map((like) => like.commentId));
			})(),
		]);

		return c.json({
			data: replies.map((reply) => ({
				...reply,
				isLikedByAuthenticatedUser: likedCommentIds.has(reply.id),
				author: authorsMap.get(reply.authorId) ?? null,
			})),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	},
});

export { getCommentRepliesRoute };
