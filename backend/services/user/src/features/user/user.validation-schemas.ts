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
	removeProfilePicture: z.enum(["true", "false"]).optional(),
	removeCoverPicture: z.enum(["true", "false"]).optional(),
});

const ChangePasswordValidationSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8),
});

const RequestEmailChangeValidationSchema = z.object({
	newEmail: z.string().trim().email(),
});

const CompleteEmailChangeValidationSchema = z.object({
	userVerification: z.object({
		id: z.string(),
		token: z.string(),
	}),
});

const ProfileMediaFileResponseBody = z
	.object({
		id: z.string(),
		filename: z.string(),
	})
	.nullable();

const UserProfileResponseBody = z.object({
	id: z.string(),
	email: z.string(),
	username: z.string(),
	fullName: z.string().nullable(),
	bio: z.string().nullable(),
	lowQualityProfilePictureFile: ProfileMediaFileResponseBody,
	bestQualityProfilePictureFile: ProfileMediaFileResponseBody,
	lowQualityCoverPictureFile: ProfileMediaFileResponseBody,
	bestQualityCoverPictureFile: ProfileMediaFileResponseBody,
	postCount: z.number(),
	followersCount: z.number(),
	followingCount: z.number(),
	unseenNotificationsCount: z.number(),
	createdAt: z.date(),
});

export {
	ChangePasswordValidationSchema,
	CompleteEmailChangeValidationSchema,
	ProfileMediaFileResponseBody,
	RequestEmailChangeValidationSchema,
	UpdateProfileValidationSchema,
	UserProfileResponseBody,
};
