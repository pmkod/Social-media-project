import { z } from "zod";

export const UserProfileResponseSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	displayName: z.string().nullable(),
	bio: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	location: z.string().nullable(),
	website: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
