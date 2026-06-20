import { z } from "@hono/zod-openapi";

export const UserResponseSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	username: z.string(),
	fullName: z.string(),
	emailVerified: z.boolean(),
	active: z.boolean(),
	displayName: z.string().nullable(),
	bio: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	location: z.string().nullable(),
	website: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const ValidateCredentialsBodySchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const CreateUserBodySchema = z.object({
	email: z.string().email(),
	username: z.string(),
	passwordHash: z.string(),
	fullName: z.string(),
});

export const GetUserByEmailQuerySchema = z.object({
	email: z.string().email(),
});

export const GetUserByUsernameQuerySchema = z.object({
	username: z.string(),
});

export const GetUserByIdParamsSchema = z.object({
	id: z.string().uuid(),
});
