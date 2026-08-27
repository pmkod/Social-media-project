import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import { NotificationsRoutesTag } from "../notifications.constants";
import { RemoveNotificationRequestBody } from "../notifications.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/internal/notifications/remove",
	summary: "Remove a notification when its source event is reverted",
	tags: [NotificationsRoutesTag],
	request: {
		body: {
			content: {
				"application/json": { schema: RemoveNotificationRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Notification removed" },
	},
});

const removeNotificationRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { eventType, sourceId } = c.req.valid("json");
		const notification = await prisma.notification.findUnique({
			where: { eventType_sourceId: { eventType, sourceId } },
			select: { id: true, recipientId: true, isSeen: true },
		});

		if (!notification) return c.json({ removed: false });

		await prisma.notification.delete({ where: { id: notification.id } });
		if (!notification.isSeen) {
			await userServiceClient.updateUnseenNotificationsCount(
				notification.recipientId,
				{ delta: -1 },
			);
		}

		return c.json({ removed: true });
	},
});

export { removeNotificationRoute };
