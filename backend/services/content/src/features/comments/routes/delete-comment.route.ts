import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
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
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { id } = c.req.valid("param");

		const comment = await prisma.comment.findUnique({
			where: { id },
		});

		if (!comment) {
			throw new Error("Comment not found");
		}

		if (comment.authorId !== authenticatedUserId) {
			throw new Error("You are not authorized to delete this comment");
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
