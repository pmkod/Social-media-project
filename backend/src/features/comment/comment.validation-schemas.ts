import z from "zod";
import { PostValidationSchema } from "../post/post.validation-schemas";

const CommentValidationSchema = z.object({
	id: z.string(),
	content: z.string(),
});

const CreateCommentValidationSchema = z.object({
	content: CommentValidationSchema.shape.content,
	postId: PostValidationSchema.shape.id,
});

export { CommentValidationSchema, CreateCommentValidationSchema };
