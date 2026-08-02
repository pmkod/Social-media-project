import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import {
	PostMediaCompressionFormat,
	PostMediaTypes,
	PostsRoutesTag,
} from "../posts.constants";
import { PostValidationSchema } from "../posts.validation-schemas";
import { compressPostMediaFile } from "../services/post-media-compression.service";
import { setPostMediaFile } from "../services/post-media-storage.service";

const CreatePostRequestBody = z.object({
	text: PostValidationSchema.shape.text,
	medias: PostValidationSchema.shape.medias.optional(),
});

const routeDef = createRoute({
	method: "post",
	path: "/posts",
	middleware: [requireUserAuthentication],
	summary: "Create post",
	tags: [PostsRoutesTag],
	request: {
		body: {
			content: {
				"multipart/form-data": { schema: CreatePostRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			content: {
				"application/json": {
					schema: z.object({ message: z.string(), post: z.object() }),
				},
			},
			description: "Created post",
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

		const { text, medias } = c.req.valid("form");

		const post = await prisma.post.create({
			data: {
				authorId: authenticatedUserId,
				text,
			},
			select: {
				id: true,
			},
		});

		if (medias && medias.length > 0) {
			const startingPosition = 1;
			for (let i = 0; i < medias.length; i++) {
				const media = medias[i];
				if (!(media instanceof File)) continue;
				const position = startingPosition + i;

				const isVideo = media.type.startsWith("video/");
				const mediaType = isVideo ? PostMediaTypes.VIDEO : PostMediaTypes.IMAGE;

				const lowQualityFile = isVideo
					? media
					: await compressPostMediaFile({
							file: media,
							quality: 50,
						});
				const highQualityFile = media;

				const lowQualityFileExt = isVideo
					? media.name.split(".").pop() || "mp4"
					: PostMediaCompressionFormat.ext;
				const highQualityFileExt =
					highQualityFile.name.split(".").pop() || "webp";

				const lowQualityMediaFileName = `post_${post.id}_low_${Date.now()}_${i}.${lowQualityFileExt}`;
				const highQualityMediaFileName = `post_${post.id}_high_${Date.now()}_${i}.${highQualityFileExt}`;

				await setPostMediaFile({
					file: lowQualityFile,
					filename: lowQualityMediaFileName,
				});
				await setPostMediaFile({
					file: highQualityFile,
					filename: highQualityMediaFileName,
				});

				await prisma.postMedia.create({
					data: {
						post: {
							connect: {
								id: post.id,
							},
						},
						position: position,
						mediaType: mediaType,
						lowQualityFile: {
							create: {
								filename: lowQualityMediaFileName,
								mimeType: lowQualityFile.type,
							},
						},
						highQualityFile: {
							create: {
								filename: highQualityMediaFileName,
								mimeType: highQualityFile.type,
							},
						},
					},
				});
			}
		}

		const postToSend = await prisma.post.findUniqueOrThrow({
			where: {
				id: post.id,
			},
			select: {
				id: true,
				text: true,
				medias: {
					select: {
						id: true,
						highQualityFile: { select: { filename: true } },
						position: true,
					},
				},
			},
		});

		return c.json(
			{ message: "Post created successfully", post: postToSend },
			HttpStatus.CREATED.code,
		);
	},
});

export { createPostRoute };
