import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import {
	PostMediaCompressionFormat,
	PostMediaTypes,
	PostsRoutesTag,
} from "../posts.constants";
import { CreatePostRequestBody } from "../posts.validation-schemas";
import { deleteFile } from "@/core/services/storage.service";
import type { Prisma } from "@/generated/prisma/client";
import { compressPostMediaFile } from "../services/post-media-compression.service";
import { setPostMediaFile } from "../services/post-media-storage.service";

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

		const authors = await userServiceClient.fetchAuthorsBatch(
			[authenticatedUserId],
			authenticatedUserId,
		);
		const postId = crypto.randomUUID();
		const uploadedFiles: string[] = [];
		let postToSend;
		try {
			const mediaRecords: Prisma.PostMediaCreateWithoutPostInput[] = [];
			for (const [index, media] of medias.entries()) {
				const isVideo = media.type.startsWith("video/");
				const lowQualityFile = isVideo
					? media
					: await compressPostMediaFile({ file: media, quality: 50 });
				const extensions: Record<string, string> = {
					"video/mp4": "mp4",
					"video/webm": "webm",
					"video/ogg": "ogg",
					"image/jpeg": "jpg",
					"image/png": "png",
					"image/webp": "webp",
				};
				const lowFilename = `post_${postId}_low_${index}.${extensions[lowQualityFile.type] ?? PostMediaCompressionFormat.ext}`;
				const highFilename = `post_${postId}_high_${index}.${extensions[media.type]}`;
				for (const [file, filename] of [
					[lowQualityFile, lowFilename],
					[media, highFilename],
				] as const) {
					uploadedFiles.push(filename);
					await setPostMediaFile({ file, filename });
				}
				mediaRecords.push({
					position: index + 1,
					mediaType: isVideo ? PostMediaTypes.VIDEO : PostMediaTypes.IMAGE,
					lowQualityFile: {
						create: { filename: lowFilename, mimeType: lowQualityFile.type },
					},
					highQualityFile: {
						create: { filename: highFilename, mimeType: media.type },
					},
				});
			}
			// Publish only once every media upload succeeds. Nested writes are atomic.
			postToSend = await prisma.post.create({
				data: {
					id: postId,
					authorId: authenticatedUserId,
					text,
					medias: { create: mediaRecords },
				},
				include: {
					medias: {
						include: { lowQualityFile: true, highQualityFile: true },
						orderBy: { position: "asc" },
					},
				},
			});
		} catch (error) {
			await Promise.allSettled(
				uploadedFiles.map((fileName) => deleteFile({ fileName })),
			);
			throw error;
		}
		await userServiceClient.adjustPostCount(authenticatedUserId, 1);

		return c.json(
			{
				message: "Post created successfully",
				post: {
					...postToSend,
					author: authors.get(authenticatedUserId) ?? null,
					isLikedByAuthenticatedUser: false,
					isBookmarkedByAuthenticatedUser: false,
				},
			},
			HttpStatus.CREATED.code,
		);
	},
});

export { createPostRoute };
