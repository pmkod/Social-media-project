import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { getActiveMembership } from "@/features/discussions/discussions.service";
import { MessagesRoutesTag } from "../messages.constants";
import { getMessageImage } from "../services/message-image-storage.service";

const routeDef = createRoute({
	method: "get",
	path: "/messages/{messageId}/images/{imageId}/{quality}",
	summary: "Get a protected message image",
	description:
		"Returns a message image only when the authenticated user is still an active member of its discussion.",
	tags: [MessagesRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			messageId: z.string().min(1),
			imageId: z.string().min(1),
			quality: z.enum(["low", "high"]),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Protected image stream" },
		[HttpStatus.NOT_FOUND.code]: { description: "Image not found" },
	},
});

const getMessageImageRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { messageId, imageId, quality } = c.req.valid("param");
		const image = await prisma.messageMedia.findFirst({
			where: {
				id: imageId,
				messageId,
				type: "IMAGE",
				message: { deletedAt: null },
			},
			select: {
				mimeType: true,
				lowQualityFileName: true,
				highQualityFileName: true,
				message: { select: { discussionId: true } },
			},
		});

		if (!image) {
			throw new Exception({
				message: "Message image not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		await getActiveMembership(
			image.message.discussionId,
			authenticatedUserId,
		);

		const fileName =
			quality === "low"
				? image.lowQualityFileName
				: image.highQualityFileName;
		if (!fileName) {
			throw new Exception({
				message: "Requested message image quality not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		const s3File = getMessageImage(fileName);
		if (!(await s3File.exists())) {
			throw new Exception({
				message: "Message image file not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		const extension = fileName.split(".").pop()?.toLowerCase();
		const mimeType =
			quality === "low" && extension === "webp"
				? "image/webp"
				: image.mimeType || s3File.type || "application/octet-stream";

		return c.body(s3File.stream(), HttpStatus.OK.code, {
			"Content-Type": mimeType,
			"Cache-Control": "private, no-store",
			"X-Content-Type-Options": "nosniff",
		});
	},
});

export { getMessageImageRoute };
