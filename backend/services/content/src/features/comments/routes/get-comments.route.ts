import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import { CommentsRoutesTag } from "../comments.constants";

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
			description: "List of comments with authors",
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
		const authenticatedUserId = c.req.header("X-Authenticated-User-Id");
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
		const blockRelationships = authenticatedUserId
			? await userServiceClient.fetchBlockRelationshipIds(authenticatedUserId)
			: { blockedUserIds: [], blockedByUserIds: [] };
		const hiddenUserIds = [
			...blockRelationships.blockedUserIds,
			...blockRelationships.blockedByUserIds,
		];
		const commentsWhere = {
			postId,
			parentId: null,
			...(hiddenUserIds.length > 0
				? { authorId: { notIn: hiddenUserIds } }
				: {}),
		};

		const [comments, total] = await Promise.all([
			prisma.comment.findMany({
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
					replies: {
						where:
							hiddenUserIds.length > 0
								? { authorId: { notIn: hiddenUserIds } }
								: undefined,
						take: 2,
						orderBy: { createdAt: "asc" },
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
					},
				},
			}),
			prisma.comment.count({ where: commentsWhere }),
		]);

		const allComments = comments.flatMap((comment) => [
			comment,
			...comment.replies,
		]);
		const authorIds = Array.from(
			new Set(allComments.map((comment) => comment.authorId).filter(Boolean)),
		);
		const [authorsMap, likedCommentIds] = await Promise.all([
			userServiceClient.fetchAuthorsBatch(authorIds, authenticatedUserId),
			(async () => {
				if (!authenticatedUserId || allComments.length === 0) {
					return new Set<string>();
				}
				const likes = await prisma.commentLike.findMany({
					where: {
						authorId: authenticatedUserId,
						commentId: { in: allComments.map((comment) => comment.id) },
					},
					select: { commentId: true },
				});
				return new Set(likes.map((like) => like.commentId));
			})(),
		]);

		const enrichedComments = comments.map((comment) => {
			const { replies, ...commentData } = comment;
			return {
				...commentData,
				isLikedByAuthenticatedUser: likedCommentIds.has(comment.id),
				author: authorsMap.get(comment.authorId) ?? null,
				replies: replies.map((reply) => ({
					...reply,
					isLikedByAuthenticatedUser: likedCommentIds.has(reply.id),
					author: authorsMap.get(reply.authorId) ?? null,
				})),
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
