import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import {
	NotificationEventTypes,
	NotificationGroupKeyBuilder,
	notificationServiceClient,
} from "@/core/services/notification-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/content/unlike-comment/{commentId}",
	summary: "Unlike a comment",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			commentId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Comment unliked successfully",
		},
	},
});

const unlikeCommentRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;

		const { commentId } = c.req.valid("param");

		const comment = await prisma.comment.findFirst({
			where: { id: commentId, exists: true, post: { exists: true } },
			select: { id: true, authorId: true, postId: true },
		});

		if (!comment) {
			throw new Exception({
				code: ExceptionCodes.comment_not_found,
				message: "Comment not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		const deleted = await prisma.commentLike.deleteMany({
			where: {
				commentId,
				authorId: authenticatedUserId,
			},
		});

		if (deleted.count > 0) {
			await prisma.comment.update({
				where: { id: commentId, exists: true },
				data: {
					likesCount: {
						decrement: 1,
					},
				},
			});
			await notificationServiceClient.removeNotification({
				eventType: NotificationEventTypes.COMMENT_LIKE,
				recipientId: comment.authorId,
				initiatorId: authenticatedUserId,
				targetId: commentId,
				groupKey: NotificationGroupKeyBuilder.buildCommentLike(
					commentId,
					comment.postId,
				),
			});
		}

		const { likesCount } = await prisma.comment.findUniqueOrThrow({
			where: { id: commentId, exists: true },
			select: { likesCount: true },
		});

		return c.json({ message: "Comment unliked", likesCount });
	},
});

export { unlikeCommentRoute };
