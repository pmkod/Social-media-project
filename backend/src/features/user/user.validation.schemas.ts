import { z } from "@hono/zod-openapi";

const UserValidationSchema = z.object({
	id: z.string(),
	fullName: z.string(),
	username: z.string(),
	email: z.email(),
	password: z.string(),
});

export { UserValidationSchema };
