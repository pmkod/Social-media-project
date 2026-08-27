import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import { Prisma } from "@/generated/prisma/client";
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
		if (data.recipientId === data.actorId) {
			return c.json({ created: false, reason: "self-notification" });
		}

		let notificationId: string;
		try {
			const notification = await prisma.notification.create({
				data: {
					...data,
					contentPreview: data.contentPreview?.trim() || null,
				},
				select: { id: true },
			});
			notificationId = notification.id;
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				return c.json({ created: false, reason: "already-exists" });
			}
			throw error;
		}

		await userServiceClient.updateUnseenNotificationsCount(data.recipientId, {
			delta: 1,
		});

		return c.json({ created: true, notificationId }, HttpStatus.CREATED.code);
	},
});

export { createNotificationRoute };
