import z from "zod";

const PostValidationSchema = z.object({
	id: z.string(),
	content: z.string(),
});

const CreatePostValidationSchema = z.object({
	content: PostValidationSchema.shape.content,
});

const GetPostsValidationSchema = z.object({});

const GetPostValidationSchema = z.object({
	postId: PostValidationSchema.shape.id,
});

const LikePostValidationSchema = z.object({
	postId: PostValidationSchema.shape.id,
});

const UnlikePostValidationSchema = z.object({
	postId: PostValidationSchema.shape.id,
});

export {
	CreatePostValidationSchema,
	GetPostsValidationSchema,
	GetPostValidationSchema,
	LikePostValidationSchema,
	PostValidationSchema,
	UnlikePostValidationSchema,
};
