import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { Configurations } from "@/core/configurations";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { createPostMedias } from "@/features/media/services/create-post-medias.service";
import { PostsRoutesTag } from "../posts.constants";



const routeDef = createRoute({
	method: "post",
	path: "/posts",
	summary: "Create a new post with multi-quality S3 media files",
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
		let jsonMedias: Array<{
			mediaType?: string;
			lowQualityFileId?: string;
			highQualityFileId?: string;
		}> = [];

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
				if (Array.isArray(jsonBody.medias)) {
					jsonMedias = jsonBody.medias;
				}
			} catch {
				// Empty body or unrecognized format
			}
		}

		const post = await prisma.post.create({
			data: {
				authorId: authenticatedUserId,
				content: text,
			},
		});

		let createdMediasList = [];

		if (mediaFiles.length > 0) {
			createdMediasList = await createPostMedias({
				postId: post.id,
				medias: mediaFiles.slice(0, 4),
			});
		} else if (jsonMedias.length > 0) {
			for (let i = 0; i < jsonMedias.length; i++) {
				const item = jsonMedias[i];
				const postMedia = await prisma.postMedia.create({
					data: {
						postId: post.id,
						position: i + 1,
						mediaType: item.mediaType || "image",
						lowQualityFileId: item.lowQualityFileId,
						highQualityFileId: item.highQualityFileId,
					},
					include: {
						lowQualityFile: true,
						highQualityFile: true,
					},
				});

				createdMediasList.push({
					id: postMedia.id,
					mediaType: postMedia.mediaType,
					position: postMedia.position,
					lowQualityUrl: getFilePublicUrl(postMedia.lowQualityFile?.filename),
					highQualityUrl: getFilePublicUrl(postMedia.highQualityFile?.filename),
				});
			}
		}

		const { content, ...rest } = post;

		return c.json(
			{
				...rest,
				text: content,
				medias: createdMediasList,
				mediaUrls: createdMediasList.map((m) => m.lowQualityUrl),
			},
			HttpStatus.CREATED.code,
		);
	},
});

export { createPostRoute };
