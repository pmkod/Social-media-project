import { z } from "@hono/zod-openapi";

const CreateCommentValidationSchema = z.object({
	content: z.string().min(1).max(2000),
});

const CommentResponseBody = z.object({
	id: z.string(),
	postId: z.string(),
	authorId: z.string(),
	content: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export { CreateCommentValidationSchema, CommentResponseBody };
