import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/service-clients/user-service.client";
import { NotificationEventTypes } from "../../../../../../shared/notification.constants";
import { NotificationsRoutesTag } from "../notifications.constants";

const routeDef = createRoute({
	method: "post",
	path: "/internal/notification/remove-comment-notifications",
	summary: "Remove the creation notification for a deleted comment",
	tags: [NotificationsRoutesTag],
	request: {
		body: {
			content: {
				"application/json": {
					schema: z.object({ commentId: z.string().min(1) }),
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Comment notification removed" },
	},
});

const removeCommentNotificationsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { commentId } = c.req.valid("json");
		const commentNotificationWhere = {
			targetId: commentId,
			eventType: {
				in: [
					NotificationEventTypes.POST_COMMENT,
					NotificationEventTypes.COMMENT_REPLY,
				],
			},
		};
		const notifications = await prisma.notification.findMany({
			where: commentNotificationWhere,
			select: { recipientId: true, isSeen: true },
		});
		if (notifications.length === 0) return c.json({ removedCount: 0 });

		await prisma.notification.deleteMany({
			where: commentNotificationWhere,
		});
		const unseenCountsByRecipient = new Map<string, number>();
		for (const notification of notifications) {
			if (notification.isSeen) continue;
			unseenCountsByRecipient.set(
				notification.recipientId,
				(unseenCountsByRecipient.get(notification.recipientId) ?? 0) + 1,
			);
		}
		await Promise.all(
			Array.from(unseenCountsByRecipient, ([recipientId, count]) =>
				userServiceClient.updateUnseenNotificationsCount({
					userId: recipientId,
					delta: -count,
				}),
			),
		);

		return c.json({ removedCount: notifications.length });
	},
});

export { removeCommentNotificationsRoute };
