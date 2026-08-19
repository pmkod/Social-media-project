import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { getS3File } from "@/core/services/storage.service";
import { MediaRoutesTag } from "../media.constants";

const routeDef = createRoute({
	method: "get",
	path: "/videos/{fileName}",
	summary: "Serve video file from S3 with Range streaming support",
	tags: [MediaRoutesTag],
	request: {
		params: z.object({
			fileName: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Video stream (Full content)",
		},
		206: {
			description: "Video stream (Partial content - Range)",
		},
		[HttpStatus.NOT_FOUND.code]: {
			description: "Video not found",
		},
	},
});

const getVideoRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { fileName } = c.req.valid("param");

		const s3File = getS3File({ fileName });
		const exists = await s3File.exists();
		if (!exists) {
			return c.json(
				{ error: "Video not found" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		const ext = fileName.split(".").pop()?.toLowerCase();
		let mimeType = s3File.type || "video/mp4";
		if (ext === "mp4") mimeType = "video/mp4";
		else if (ext === "webm") mimeType = "video/webm";
		else if (ext === "ogg") mimeType = "video/ogg";
		else if (ext === "mov") mimeType = "video/quicktime";

		const fileSize = s3File.size;
		const rangeHeader = c.req.header("range");

		if (rangeHeader) {
			const parts = rangeHeader.replace(/bytes=/, "").split("-");
			const start = Number.parseInt(parts[0], 10);
			const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;

			if (
				Number.isNaN(start) ||
				start >= fileSize ||
				end >= fileSize ||
				start > end
			) {
				return c.text("Requested range not satisfiable", 416, {
					"Content-Range": `bytes */${fileSize}`,
				});
			}

			const chunkSize = end - start + 1;
			const slicedFile = s3File.slice(start, end + 1);

			return c.body(slicedFile.stream(), 206, {
				"Content-Range": `bytes ${start}-${end}/${fileSize}`,
				"Accept-Ranges": "bytes",
				"Content-Length": chunkSize.toString(),
				"Content-Type": mimeType,
				"Cache-Control": "public, max-age=31536000, immutable",
			});
		}

		return c.body(s3File.stream(), HttpStatus.OK.code, {
			"Content-Type": mimeType,
			"Accept-Ranges": "bytes",
			"Content-Length": fileSize.toString(),
			"Cache-Control": "public, max-age=31536000, immutable",
		});
	},
});

export { getVideoRoute };
