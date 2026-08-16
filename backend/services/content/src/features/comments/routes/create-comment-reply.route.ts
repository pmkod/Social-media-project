import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";
import { CreateCommentValidationSchema } from "../comments.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/comments/{commentId}/replies",
	summary: "Reply to a comment",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ commentId: z.string() }),
		body: {
			content: {
				"multipart/form-data": {
					schema: z.object({
						content: CreateCommentValidationSchema.shape.content,
					}),
				},
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Reply created" },
	},
});

const createCommentReplyRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");

		const { commentId } = c.req.valid("param");
		const { content } = c.req.valid("form");
		const targetComment = await prisma.comment.findUnique({
			where: { id: commentId },
			select: { id: true, parentId: true, postId: true },
		});

		if (!targetComment) {
			return c.json({ error: "Comment not found" }, HttpStatus.NOT_FOUND.code);
		}

		const parentId = targetComment.parentId ?? targetComment.id;
		const reply = await prisma.$transaction(async (tx) => {
			const createdReply = await tx.comment.create({
				data: {
					postId: targetComment.postId,
					parentId,
					authorId: authenticatedUserId,
					content: content.trim(),
				},
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
			});

			await Promise.all([
				tx.comment.update({
					where: { id: parentId },
					data: { repliesCount: { increment: 1 } },
				}),
				tx.post.update({
					where: { id: targetComment.postId },
					data: { commentsCount: { increment: 1 } },
				}),
			]);

			return createdReply;
		});

		const authorsMap = await userServiceClient.fetchAuthorsBatch([
			authenticatedUserId,
		]);

		return c.json(
			{
				message: "Reply created successfully",
				comment: {
					...reply,
					isLikedByAuthenticatedUser: false,
					author: authorsMap.get(authenticatedUserId) ?? null,
				},
			},
			HttpStatus.CREATED.code,
		);
	},
});

export { createCommentReplyRoute };
