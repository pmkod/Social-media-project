import { z } from "@hono/zod-openapi";

const UpdateProfileValidationSchema = z.object({
	fullName: z.string().min(1).optional(),
	bio: z.string().optional(),
	avatarUrl: z.string().url().optional().or(z.literal("")),
	coverUrl: z.string().url().optional().or(z.literal("")),
});

const UserProfileResponseBody = z.object({
	id: z.string(),
	email: z.string(),
	username: z.string(),
	fullName: z.string().nullable(),
	bio: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	coverUrl: z.string().nullable(),
	postCount: z.number(),
	followersCount: z.number(),
	followingCount: z.number(),
	createdAt: z.date(),
});

export { UpdateProfileValidationSchema, UserProfileResponseBody };
