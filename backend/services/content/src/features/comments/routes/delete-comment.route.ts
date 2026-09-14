import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import { notificationServiceClient } from "@/core/services/notification-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/comments/{id}",
	summary: "Delete a comment",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Comment deleted",
		},
	},
});

const deleteCommentRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;

		const { id } = c.req.valid("param");

		const comment = await prisma.comment.findUnique({
			where: { id },
		});

		if (!comment) {
			throw new Exception({
				code: ExceptionCodes.comment_not_found,
				message: "Comment not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		if (comment.authorId !== authenticatedUserId) {
			throw new Exception({
				code: ExceptionCodes.cannot_delete_comment,
				message: "You are not authorized to delete this comment",
				status: HttpStatus.FORBIDDEN.code,
			});
		}
		if (comment.deletedAt) {
			return c.json({ message: "Comment already deleted" });
		}

		await prisma.$transaction([
			prisma.comment.update({
				where: { id },
				data: { deletedAt: new Date(), likesCount: 0 },
			}),
			prisma.commentLike.deleteMany({ where: { commentId: id } }),
			prisma.post.update({
				where: { id: comment.postId },
				data: { commentsCount: { decrement: 1 } },
			}),
		]);
		await notificationServiceClient.removeNotificationsForComment(comment.id);

		return c.json({ message: "Comment deleted successfully" });
	},
});

export { deleteCommentRoute };
