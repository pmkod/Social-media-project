import z from "zod";

const PostValidationSchema = z.object({
	id: z.string(),
	content: z.string(),
});

const CreatePostValidationSchema = z.object({
	content: PostValidationSchema.shape.content,
});

const LikePostValidationSchema = z.object({
	postId: PostValidationSchema.shape.content,
});

const UnlikePostValidationSchema = z.object({
	postId: PostValidationSchema.shape.content,
});

export {
	CreatePostValidationSchema,
	LikePostValidationSchema,
	PostValidationSchema,
	UnlikePostValidationSchema,
};
