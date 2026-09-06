import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import { NotificationGroupKeyBuilder } from "../../../../../../shared/notification-group-key.builder";
import { NotificationsRoutesTag } from "../notifications.constants";

const routeDef = createRoute({
	method: "post",
	path: "/internal/notifications/remove-by-post",
	summary: "Remove notifications that point to a deleted post",
	tags: [NotificationsRoutesTag],
	request: {
		body: {
			content: {
				"application/json": {
					schema: z.object({ postId: z.string().min(1) }),
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Post notifications removed" },
	},
});

const removePostNotificationsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { postId } = c.req.valid("json");
		const postNotificationsWhere = {
			OR: [
				{ targetId: postId },
				{
					groupKey: NotificationGroupKeyBuilder.buildPostComment(postId),
				},
				{ groupKey: { endsWith: `:${postId}` } },
			],
		};
		const notifications = await prisma.notification.findMany({
			where: postNotificationsWhere,
			select: { recipientId: true, isSeen: true },
		});
		if (notifications.length === 0) return c.json({ removedCount: 0 });

		await prisma.notification.deleteMany({ where: postNotificationsWhere });
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
				userServiceClient.updateUnseenNotificationsCount(recipientId, {
					delta: -count,
				}),
			),
		);

		return c.json({ removedCount: notifications.length });
	},
});

export { removePostNotificationsRoute };
