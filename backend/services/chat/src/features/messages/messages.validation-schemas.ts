import { z } from "@hono/zod-openapi";

const MessageMediaInputSchema = z.object({
	type: z.enum(["IMAGE", "VIDEO", "AUDIO", "FILE"]),
	url: z.string().url().max(2048),
	fileName: z.string().trim().min(1).max(255).optional(),
	mimeType: z.string().trim().min(1).max(127).optional(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional(),
});

const CreateMessageRequestBody = z
	.object({
		content: z.string().trim().min(1).max(4000).optional(),
		media: z.array(MessageMediaInputSchema).max(10).optional(),
		parentMessageId: z.string().min(1).optional(),
	})
	.refine((data) => Boolean(data.content || data.media?.length), {
		message: "A message must contain text or media",
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
