import { z } from "@hono/zod-openapi";

const CreateMessageRequestBody = z.object({
	content: z.string().trim().min(1).max(4000),
	parentMessageId: z.string().min(1).optional(),
});

const UpdateMessageRequestBody = z.object({
	content: z.string().trim().min(1).max(4000),
});

const MessageIdParams = z.object({
	messageId: z.string().min(1),
});

export {
	CreateMessageRequestBody,
	MessageIdParams,
	UpdateMessageRequestBody,
};
