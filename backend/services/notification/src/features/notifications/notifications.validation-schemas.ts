import { z } from "@hono/zod-openapi";
import { NotificationEventTypes } from "./notifications.constants";

const NotificationEventTypeSchema = z.enum(NotificationEventTypes);

const CreateNotificationRequestBody = z.object({
	recipientId: z.string().min(1),
	initiatorId: z.string().min(1),
	eventType: NotificationEventTypeSchema,
	targetId: z.string().min(1).optional(),
	groupKey: z.string().min(1),
});

const RemoveNotificationRequestBody = z.object({
	eventType: NotificationEventTypeSchema,
	recipientId: z.string().min(1),
	initiatorId: z.string().min(1),
	targetId: z.string().min(1).optional(),
	groupKey: z.string().min(1),
});

export {
	CreateNotificationRequestBody,
	NotificationEventTypeSchema,
	RemoveNotificationRequestBody,
};
