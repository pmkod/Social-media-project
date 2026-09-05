import { z } from "@hono/zod-openapi";

const PostValidationSchema = z.object({
	id: z.string(),
	text: z.string().trim().max(5000),
	createdAt: z.string(),
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
				.min(1)
				.max(20_000_000),
		)
		.max(4),
});

export { PostValidationSchema };

// Multipart forms contain a File for one upload and an array for several.
export const CreatePostRequestBody = z
	.object({
		text: PostValidationSchema.shape.text.default(""),
		medias: z
			.union([
				PostValidationSchema.shape.medias.element.transform((file) => [file]),
				PostValidationSchema.shape.medias,
			])
			.default([]),
	})
	.superRefine((data, ctx) => {
		if (!data.text && data.medias.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["text"],
				message: "Add text or at least one media file.",
			});
		}
	});
