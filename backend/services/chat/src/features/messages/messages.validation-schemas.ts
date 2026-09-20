import { z } from "@hono/zod-openapi";
import {
	MessageImageLimits,
	MessageImageMimeTypes,
} from "./messages.constants";

const MessageImageSchema = z
	.file()
	.mime([...MessageImageMimeTypes])
	.min(1)
	.max(MessageImageLimits.maxFileSize);

const CreateMessageRequestBody = z
	.object({
		content: z.string().trim().max(4000).default(""),
		images: z
			.union([
				MessageImageSchema.transform((file) => [file]),
				z.array(MessageImageSchema).max(MessageImageLimits.maxCount),
			])
			.default([]),
		parentMessageId: z.string().min(1).optional(),
	})
	.refine((data) => Boolean(data.content || data.images.length), {
		message: "A message must contain text or at least one image",
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
