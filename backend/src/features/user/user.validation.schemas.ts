import { z } from "@hono/zod-openapi";

const UserValidationSchema = z.object({
	id: z.string(),
	fullName: z.string(),
	username: z.string(),
	email: z.email(),
	password: z.string(),
});

const GetUserValidationSchema = z.object({
	username: UserValidationSchema.shape.username,
});

export { GetUserValidationSchema, UserValidationSchema };
