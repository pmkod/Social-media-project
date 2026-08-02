import { z } from "@hono/zod-openapi";

const CreatePostValidationSchema = z.object({
	text: z.string().min(1).max(5000),
	mediaUrls: z.array(z.string().url()).optional().default([]),
});

const UpdatePostValidationSchema = z.object({
	text: z.string().min(1).max(5000).optional(),
	mediaUrls: z.array(z.string().url()).optional(),
});

const PostResponseBody = z.object({
	id: z.string(),
	authorId: z.string(),
	text: z.string(),
	mediaUrls: z.array(z.string()),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export {
	CreatePostValidationSchema,
	UpdatePostValidationSchema,
	PostResponseBody,
};
