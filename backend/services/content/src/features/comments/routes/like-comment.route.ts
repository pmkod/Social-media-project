import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import {
	NotificationEventTypes,
	NotificationGroupKeyBuilder,
	notificationServiceClient,
} from "@/core/services/notification-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "post",
	path: "/comments/{commentId}/likes",
	summary: "Like a comment",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			commentId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Comment liked successfully",
		},
	},
});

const likeCommentRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;

		const { commentId } = c.req.valid("param");

		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
			select: {
				id: true,
				authorId: true,
				postId: true,
				deletedAt: true,
			},
		});

		if (!comment || comment.deletedAt) {
			throw new Error("Comment not found");
		}

		const existingLike = await prisma.commentLike.findUnique({
			where: {
				commentId_authorId: {
					commentId,
					authorId: authenticatedUserId,
				},
			},
			select: { id: true },
		});

		let createdLike = false;
		if (!existingLike) {
			try {
				await prisma.$transaction([
					prisma.commentLike.create({
						data: {
							commentId,
							authorId: authenticatedUserId,
						},
					}),
					prisma.comment.update({
						where: { id: commentId },
						data: { likesCount: { increment: 1 } },
					}),
				]);
				createdLike = true;
			} catch (_error) {
				// A concurrent like may have created the unique row first.
			}
		}

		if (createdLike) {
			await notificationServiceClient.createNotification({
				recipientId: comment.authorId,
				initiatorId: authenticatedUserId,
				eventType: NotificationEventTypes.COMMENT_LIKE,
				targetId: commentId,
				groupKey: NotificationGroupKeyBuilder.buildCommentLike(
					commentId,
					comment.postId,
				),
			});
		}

		const { likesCount } = await prisma.comment.findUniqueOrThrow({
			where: { id: commentId },
			select: { likesCount: true },
		});

		return c.json(
			{ message: "Comment liked", likesCount },
			HttpStatus.CREATED.code,
		);
	},
});

export { likeCommentRoute };
