import { z } from "@hono/zod-openapi";

const UserValidationSchema = z.object({
	firstName: z.string(),
	storeName: z.string(),
	lastName: z.string(),
	email: z.email(),
	password: z.string(),
});

export { UserValidationSchema };
