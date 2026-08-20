import { z } from "@hono/zod-openapi";

const UpdateProfileValidationSchema = z.object({
	username: z.string().trim().min(3).max(50),
	fullName: z.string().trim().min(1).max(100),
	bio: z.string().max(280).optional(),
	profilePicture: z
		.file()
		.mime(["image/jpeg", "image/png", "image/webp", "image/gif"])
		.max(10_000_000)
		.optional(),
	coverPicture: z
		.file()
		.mime(["image/jpeg", "image/png", "image/webp", "image/gif"])
		.max(15_000_000)
		.optional(),
});

const UserProfileResponseBody = z.object({
	id: z.string(),
	email: z.string(),
	username: z.string(),
	fullName: z.string().nullable(),
	bio: z.string().nullable(),
	profilePictureUrl: z.string().nullable(),
	lowQualityProfilePictureUrl: z.string().nullable(),
	coverPictureUrl: z.string().nullable(),
	lowQualityCoverPictureUrl: z.string().nullable(),
	postCount: z.number(),
	followersCount: z.number(),
	followingCount: z.number(),
	createdAt: z.date(),
});

export { UpdateProfileValidationSchema, UserProfileResponseBody };
