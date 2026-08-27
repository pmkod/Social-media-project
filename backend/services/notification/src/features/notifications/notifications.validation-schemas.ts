import { z } from "@hono/zod-openapi";
import { NotificationEventTypes } from "./notifications.constants";

const NotificationEventTypeSchema = z.enum(NotificationEventTypes);

const CreateNotificationRequestBody = z.object({
	recipientId: z.string().min(1),
	actorId: z.string().min(1),
	eventType: NotificationEventTypeSchema,
	entityId: z.string().min(1),
	sourceId: z.string().min(1),
	postId: z.string().min(1).optional(),
	commentId: z.string().min(1).optional(),
	contentPreview: z.string().trim().max(280).optional(),
});

const RemoveNotificationRequestBody = z.object({
	eventType: NotificationEventTypeSchema,
	sourceId: z.string().min(1),
});

export {
	CreateNotificationRequestBody,
	NotificationEventTypeSchema,
	RemoveNotificationRequestBody,
};
