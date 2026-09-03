import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { getS3File } from "@/core/services/storage.service";
import { parseVideoRange } from "../video-range";
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
		416: { description: "Requested range not satisfiable" },
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
			return c.json({ error: "Video not found" }, HttpStatus.NOT_FOUND.code);
		}

		const ext = fileName.split(".").pop()?.toLowerCase();
		let mimeType = s3File.type || "video/mp4";
		if (ext === "mp4") mimeType = "video/mp4";
		else if (ext === "webm") mimeType = "video/webm";
		else if (ext === "ogg") mimeType = "video/ogg";
		else if (ext === "mov") mimeType = "video/quicktime";

		const fileSize = (await s3File.stat()).size;
		const rangeHeader = c.req.header("range");

		if (rangeHeader) {
			const range = parseVideoRange(rangeHeader, fileSize);
			if (!range) {
				return c.text("Requested range not satisfiable", 416, {
					"Content-Range": `bytes */${fileSize}`,
				});
			}
			const { start, end } = range;

			const chunkSize = end - start + 1;
			// Bun 1.2's S3 slice().stream() ignores the slice. Request the range
			// explicitly and relay the stream, without buffering the whole video.
			const partial = await fetch(s3File.presign({ expiresIn: 60 }), {
				headers: { Range: `bytes=${start}-${end}` },
				signal: c.req.raw.signal,
			});
			if (partial.status !== 206 || !partial.body) {
				await partial.body?.cancel();
				throw new Error("Unable to stream the requested video range");
			}

			return c.body(partial.body, 206, {
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
