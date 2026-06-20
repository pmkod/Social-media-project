import { z } from "@hono/zod-openapi";

export const CreatePostValidationSchema = z.object({
	content: z.string().min(1).max(5000),
	mediaUrls: z.array(z.string().url()).optional(),
});
