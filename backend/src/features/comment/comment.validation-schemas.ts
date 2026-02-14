import z from "zod";
import { PostValidationSchema } from "../post/post.validation-schemas";

const CommentValidationSchema = z.object({
	id: z.string(),
	content: z.string(),
});

const GetCommentsValidationSchema = z.object({
	postId: PostValidationSchema.shape.id,
});

const CreateCommentValidationSchema = z.object({
	content: CommentValidationSchema.shape.content,
	postId: PostValidationSchema.shape.id,
});

const LikeCommentValidationSchema = z.object({
	commentId: CommentValidationSchema.shape.id,
});

const UnlikeCommentValidationSchema = z.object({
	commentId: CommentValidationSchema.shape.id,
});

export {
	CommentValidationSchema,
	CreateCommentValidationSchema,
	GetCommentsValidationSchema,
	LikeCommentValidationSchema,
	UnlikeCommentValidationSchema,
};
