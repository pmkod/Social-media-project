import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import {
	NotificationEventTypes,
	NotificationGroupKeyBuilder,
	notificationServiceClient,
} from "@/core/services/notification-service.client";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";

const CreateCommentRequestBody = z.object({
	postId: z.string(),
	parentCommentId: z.string().optional(),
	content: z.string().min(1).max(2000),
});

const routeDef = createRoute({
	method: "post",
	path: "/comments",
	summary: "Add a comment to a post",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: CreateCommentRequestBody,
				},
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Comment created",
		},
	},
});

const createCommentRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;

		const { postId, parentCommentId, content } = c.req.valid("form");

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { id: true, authorId: true, text: true },
		});

		if (!post) {
			throw Error("Post not found");
		}
		if (
			await userServiceClient.hasBlockRelationship(
				authenticatedUserId,
				post.authorId,
			)
		) {
			throw Error("Post not found");
		}

		let parentComment: {
			id: string;
			authorId: string;
			postId: string;
			deletedAt: Date | null;
		} | null = null;
		if (parentCommentId) {
			parentComment = await prisma.comment.findUnique({
				where: { id: parentCommentId },
				select: {
					id: true,
					authorId: true,
					postId: true,
					deletedAt: true,
				},
			});

			if (
				!parentComment ||
				parentComment.postId !== postId ||
				parentComment.deletedAt
			) {
				throw Error("Parent comment not found");
			}
		}

		const normalizedContent = content.trim();
		const comment = await prisma.$transaction(async (tx) => {
			const createdComment = await tx.comment.create({
				data: {
					postId,
					parentId: parentComment?.id ?? null,
					authorId: authenticatedUserId,
					content: normalizedContent,
				},
				select: { id: true },
			});
			await tx.post.update({
				where: { id: postId },
				data: { commentsCount: { increment: 1 } },
			});
			if (parentComment) {
				await tx.comment.update({
					where: { id: parentComment.id },
					data: { repliesCount: { increment: 1 } },
				});
			}
			return createdComment;
		});

		const eventType = parentComment
			? NotificationEventTypes.COMMENT_REPLY
			: NotificationEventTypes.POST_COMMENT;
		const groupKey = parentComment
			? NotificationGroupKeyBuilder.buildCommentReply(parentComment.id, postId)
			: NotificationGroupKeyBuilder.buildPostComment(postId);
		await notificationServiceClient.createNotification({
			recipientId: parentComment?.authorId ?? post.authorId,
			initiatorId: authenticatedUserId,
			eventType,
			targetId: comment.id,
			groupKey,
		});

		const commentToSend = await prisma.comment.findUniqueOrThrow({
			where: {
				id: comment.id,
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
				deletedAt: true,
			},
		});

		const authorsMap = await userServiceClient.fetchAuthorsBatch(
			[authenticatedUserId],
			authenticatedUserId,
		);
		const author = authorsMap.get(authenticatedUserId) ?? null;

		return c.json(
			{
				message: "Comment created successfully",
				comment: {
					...commentToSend,
					isDeleted: false,
					isLikedByAuthenticatedUser: false,
					author,
				},
			},
			HttpStatus.CREATED.code,
		);
	},
});

export { createCommentRoute };
