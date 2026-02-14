import z from "zod";
import { UserValidationSchema } from "../user/user.validation.schemas";

// const FollowValidationSchema = z.object({
// 	followerId: z.string(),
// 	followedId: z.string(),
// });

const FollowUserValidationSchema = z.object({
	followedId: UserValidationSchema.shape.id,
});

const UnfollowUserValidationSchema = z.object({
	idOfUserToUnfollow: UserValidationSchema.shape.id,
});

export { FollowUserValidationSchema, UnfollowUserValidationSchema };
