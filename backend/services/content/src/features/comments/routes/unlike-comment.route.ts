import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { notificationServiceClient } from "@/core/services/notification-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/comments/{commentId}/likes",
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
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { commentId } = c.req.valid("param");

		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
			select: { id: true },
		});

		if (!comment) {
			throw new Error("Comment not found");
		}

		const deleted = await prisma.commentLike.deleteMany({
			where: {
				commentId,
				authorId: authenticatedUserId,
			},
		});

		if (deleted.count > 0) {
			await prisma.comment.update({
				where: { id: commentId },
				data: {
					likesCount: {
						decrement: 1,
					},
				},
			});
			await notificationServiceClient.removeNotification(
				"COMMENT_LIKE",
				`comment:${commentId}:actor:${authenticatedUserId}`,
			);
		}

		const { likesCount } = await prisma.comment.findUniqueOrThrow({
			where: { id: commentId },
			select: { likesCount: true },
		});

		return c.json({
			success: true,
			message: "Comment unliked",
			likesCount,
		});
	},
});

export { unlikeCommentRoute };
