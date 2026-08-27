import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "get",
	path: "/comments",
	summary: "Get comments or replies for a post",
	tags: [CommentsRoutesTag],
	request: {
		query: z.object({
			postId: z.string(),
			parentCommentId: z.string().optional(),
			page: z.string().optional().default("1"),
			limit: z.string().optional().default("7"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "List of comments with authors",
		},
	},
});

const getCommentsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");
		const { postId, parentCommentId } = query;
		const page = Number.parseInt(query.page, 10) || 1;
		const limit = Number.parseInt(query.limit, 10) || 20;
		const skip = (page - 1) * limit;
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		});
		if (
			!post ||
			(authenticatedUserId &&
				(await userServiceClient.hasBlockRelationship(
					authenticatedUserId,
					post.authorId,
				)))
		) {
			return c.json({
				data: [],
				pagination: { total: 0, page, limit, totalPages: 0 },
			});
		}

		const commentsWhere = {
			postId,
			parentId: parentCommentId ? parentCommentId : null,
		};

		const comments = await prisma.comment.findMany({
			where: commentsWhere,
			orderBy: { createdAt: "desc" },
			skip,
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
				deletedAt: true,
			},
		});
		const total = await prisma.comment.count({ where: commentsWhere });

		const authorIds = Array.from(
			new Set(comments.map((comment) => comment.authorId).filter(Boolean)),
		);
		const authorsMap = await userServiceClient.fetchAuthorsBatch(
			authorIds,
			authenticatedUserId,
		);
		const likedCommentIds = new Set<string>();
		if (authenticatedUserId && comments.length > 0) {
			const likes = await prisma.commentLike.findMany({
				where: {
					authorId: authenticatedUserId,
					commentId: { in: comments.map((comment) => comment.id) },
				},
				select: { commentId: true },
			});
			for (const like of likes) likedCommentIds.add(like.commentId);
		}

		const enrichedComments = comments.map((comment) => {
			const isDeleted = Boolean(comment.deletedAt);
			return {
				...comment,
				content: isDeleted ? "" : comment.content,
				isDeleted,
				isLikedByAuthenticatedUser:
					!isDeleted && likedCommentIds.has(comment.id),
				author: authorsMap.get(comment.authorId) ?? null,
			};
		});

		return c.json({
			data: enrichedComments,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	},
});

export { getCommentsRoute };
