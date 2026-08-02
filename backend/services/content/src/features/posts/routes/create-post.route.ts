import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { setFile } from "@/core/services/storage.service";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "post",
	path: "/posts",
	summary: "Create a new post with optional media files",
	tags: [PostsRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Post created successfully",
		},
	},
});

const createPostRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		let text = "";
		const mediaFiles: File[] = [];

		const contentType = c.req.header("content-type") || "";

		if (contentType.includes("multipart/form-data")) {
			const formData = await c.req.formData();
			text = (formData.get("text") as string) || "";

			const medias = formData.getAll("medias");
			const singleMedia = formData.get("medias");

			if (singleMedia && singleMedia instanceof File && singleMedia.size > 0) {
				mediaFiles.push(singleMedia);
			}

			if (medias && medias.length > 0) {
				for (const m of medias) {
					if (m instanceof File && m.size > 0 && !mediaFiles.includes(m)) {
						mediaFiles.push(m);
					}
				}
			}
		} else {
			try {
				const jsonBody = await c.req.json();
				text = jsonBody.text || "";
			} catch {
				// Empty body or unrecognized format
			}
		}

		// Upload media files to S3 directly in create post
		const uploadedMediaUrls: string[] = [];
		for (const file of mediaFiles.slice(0, 4)) {
			const ext = file.name.split(".").pop() || "bin";
			const filename = `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
			const publicUrl = await setFile({ file, filename });
			uploadedMediaUrls.push(publicUrl);
		}

		const post = await prisma.post.create({
			data: {
				authorId: authenticatedUserId,
				content: text,
				mediaUrls: uploadedMediaUrls,
			},
		});

		const { content, ...rest } = post;

		return c.json({ ...rest, text: content }, HttpStatus.CREATED.code);
	},
});

export { createPostRoute };
