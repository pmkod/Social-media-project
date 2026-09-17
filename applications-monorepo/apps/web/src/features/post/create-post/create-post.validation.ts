import { z } from "zod";
import * as m from "@/paraglide/messages.js";

export const POST_MEDIA_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"video/mp4",
	"video/webm",
	"video/ogg",
];
export const POST_MAX_FILE_SIZE = 20_000_000;
export const POST_MAX_TEXT_LENGTH = 5000;

export const createPostSchema = z
	.object({
		text: z.string().trim().max(POST_MAX_TEXT_LENGTH),
		medias: z
			.array(
				z
					.custom<File>((value) => value instanceof File)
					.refine(
						(file) =>
							file.size > 0 &&
							file.size <= POST_MAX_FILE_SIZE &&
							POST_MEDIA_MIME_TYPES.includes(file.type),
						{
							error: () => m.validation_post_media_invalid(),
						},
					),
			)
			.max(4),
	})
	.superRefine((data, ctx) => {
		if (!data.text && data.medias.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["text"],
				message: m.validation_post_content_required(),
			});
		}
	});
