import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import { NotificationsRoutesTag } from "../notifications.constants";
import { CreateNotificationRequestBody } from "../notifications.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/internal/notifications",
	summary: "Create a notification from another service",
	tags: [NotificationsRoutesTag],
	request: {
		body: {
			content: {
				"application/json": { schema: CreateNotificationRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Notification created" },
		[HttpStatus.OK.code]: {
			description: "Notification already existed or skipped",
		},
	},
});

const createNotificationRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const data = c.req.valid("json");
		if (data.recipientId === data.initiatorId) {
			return c.json({ created: false, reason: "self-notification" });
		}

		const notificationIdentityWhere = {
			recipientId: data.recipientId,
			initiatorId: data.initiatorId,
			eventType: data.eventType,
			targetId: data.targetId ?? null,
			groupKey: data.groupKey,
		};
		const existingNotification = await prisma.notification.findFirst({
			where: notificationIdentityWhere,
			select: { id: true },
		});
		if (existingNotification) {
			return c.json({ created: false, reason: "already-exists" });
		}

		const notification = await prisma.notification.create({
			data,
			select: { id: true },
		});

		await userServiceClient.updateUnseenNotificationsCount(data.recipientId, {
			delta: 1,
		});

		return c.json(
			{ created: true, notificationId: notification.id },
			HttpStatus.CREATED.code,
		);
	},
});

export { createNotificationRoute };
