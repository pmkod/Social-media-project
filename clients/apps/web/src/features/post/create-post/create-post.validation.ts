import { z } from "zod";

export const POST_MEDIA_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"video/mp4",
	"video/webm",
	"video/ogg",
];
export const POST_MAX_FILE_SIZE = 20_000_000;

export const createPostSchema = z
	.object({
		text: z.string().trim().max(5000),
		medias: z
			.array(
				z
					.custom<File>((value) => value instanceof File)
					.refine(
						(file) =>
							file.size > 0 &&
							file.size <= POST_MAX_FILE_SIZE &&
							POST_MEDIA_MIME_TYPES.includes(file.type),
						"Choose a supported image or video up to 20 MB.",
					),
			)
			.max(4),
	})
	.superRefine((data, ctx) => {
		if (!data.text && data.medias.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["text"],
				message: "Add text or a media file.",
			});
		}
	});
