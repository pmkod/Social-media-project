import { z } from "@hono/zod-openapi";

const PostValidationSchema = z.object({
	id: z.string(),
	text: z.string().min(1).max(5000),
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
				.max(20_000_000),
		)
		.max(4),
});

export { PostValidationSchema };
