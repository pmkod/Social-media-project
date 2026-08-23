import { z } from "@hono/zod-openapi";

const CreateBookmarkCollectionSchema = z.object({
	name: z.string().trim().min(1).max(60),
	description: z.string().trim().max(280).optional(),
});

export { CreateBookmarkCollectionSchema };
