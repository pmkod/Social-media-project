import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { getS3File } from "@/core/services/storage.service";
import { MediaRoutesTag } from "../media.constants";

const routeDef = createRoute({
	method: "get",
	path: "/images/{fileName}",
	summary: "Serve image file from S3",
	tags: [MediaRoutesTag],
	request: {
		params: z.object({
			fileName: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Image stream",
		},
		[HttpStatus.NOT_FOUND.code]: {
			description: "Image not found",
		},
	},
});

const getImageRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { fileName } = c.req.valid("param");

		const s3File = getS3File({ fileName });
		const exists = await s3File.exists();
		if (!exists) {
			return c.json(
				{ error: "Image non trouvée" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		const ext = fileName.split(".").pop()?.toLowerCase();
		let mimeType = s3File.type || "image/jpeg";
		if (ext === "webp") mimeType = "image/webp";
		else if (ext === "png") mimeType = "image/png";
		else if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
		else if (ext === "gif") mimeType = "image/gif";
		else if (ext === "svg") mimeType = "image/svg+xml";

		return c.body(s3File.stream(), HttpStatus.OK.code, {
			"Content-Type": mimeType,
			"Cache-Control": "public, max-age=31536000, immutable",
		});
	},
});

export { getImageRoute };
