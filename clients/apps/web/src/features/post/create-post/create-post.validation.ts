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
export const SPARK_MAX_DURATION = 90;

export const createPostSchema = z
	.object({
		type: z.enum(["POST", "SPARK"]),
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
		if (data.type === "SPARK") {
			if (
				data.medias.length !== 1 ||
				!data.medias[0]?.type.startsWith("video/")
			) {
				ctx.addIssue({
					code: "custom",
					path: ["medias"],
					message: "A Spark requires exactly one video.",
				});
			}
		} else if (!data.text && data.medias.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["text"],
				message: "Add text or a media file.",
			});
		}
	});

export async function checkSparkDuration(file: File): Promise<void> {
	const url = URL.createObjectURL(file);
	const video = document.createElement("video");
	try {
		await new Promise<void>((resolve, reject) => {
			const timeout = window.setTimeout(
				() => reject(new Error("Unable to read this video. Try another file.")),
				10_000,
			);
			video.preload = "metadata";
			video.onloadedmetadata = () => {
				window.clearTimeout(timeout);
				if (
					!Number.isFinite(video.duration) ||
					video.duration <= 0 ||
					video.duration > SPARK_MAX_DURATION
				) {
					reject(new Error("Choose a video of 90 seconds or less."));
				} else resolve();
			};
			video.onerror = () => {
				window.clearTimeout(timeout);
				reject(
					new Error(
						"This video cannot be played. Try an MP4, WebM or Ogg file.",
					),
				);
			};
			video.src = url;
		});
	} finally {
		video.onloadedmetadata = null;
		video.onerror = null;
		video.removeAttribute("src");
		video.load();
		URL.revokeObjectURL(url);
	}
}
