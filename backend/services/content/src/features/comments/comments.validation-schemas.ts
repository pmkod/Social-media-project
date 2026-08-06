import { z } from "@hono/zod-openapi";

const CreateCommentValidationSchema = z
	.object({
		content: z.string().max(2000).optional(),
		medias: z
			.array(
				z
					.file()
					.mime([
						"image/jpeg",
						"image/png",
						"image/webp",
						"video/mp4",
						"video/webm",
						"video/ogg",
					])
					.max(20_000_000),
			)
			.max(4)
			.optional(),
	})
	.refine(
		(data) =>
			Boolean(data.content?.trim()) ||
			Boolean(data.medias && data.medias.length > 0),
		{
			message: "Le commentaire doit contenir du texte ou au moins un média",
		},
	);

const CommentResponseBody = z.object({
	id: z.string(),
	postId: z.string(),
	authorId: z.string(),
	content: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export { CreateCommentValidationSchema, CommentResponseBody };
