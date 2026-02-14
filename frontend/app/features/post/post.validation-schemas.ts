import z from "zod";

const PostValidationSchema = z.object({
	id: z.string(),
	content: z.string(),
});

const CreatePostValidationSchema = z.object({
	id: PostValidationSchema.shape.id,
	content: PostValidationSchema.shape.content,
});

export { CreatePostValidationSchema, PostValidationSchema };
