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
import { hydratePostMediaFiles } from "../services/post-media-files.service";
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
		const authenticatedUserId = c.get("authenticatedUser").id;

		const { text, medias } = c.req.valid("form");

		const authors = await userServiceClient.fetchAuthorsBatch(
			[authenticatedUserId],
			authenticatedUserId,
		);
		const postId = crypto.randomUUID();
		const uploadedFiles: string[] = [];
		let createdPost;
		try {
			const mediaRecords: Array<{
				position: number;
				mediaType: string;
				lowQualityFile: { filename: string; mimeType: string };
				highQualityFile: { filename: string; mimeType: string };
			}> = [];
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
						filename: lowFilename,
						mimeType: lowQualityFile.type,
					},
					highQualityFile: {
						filename: highFilename,
						mimeType: media.type,
					},
				});
			}
			// Publish only once every media upload succeeds. Database writes stay atomic.
			createdPost = await prisma.$transaction(async (transaction) => {
				const mediasWithFileIds: Prisma.PostMediaCreateWithoutPostInput[] = [];
				for (const mediaRecord of mediaRecords) {
					const lowQualityFile = await transaction.file.create({
						data: mediaRecord.lowQualityFile,
						select: { id: true },
					});
					const highQualityFile = await transaction.file.create({
						data: mediaRecord.highQualityFile,
						select: { id: true },
					});
					mediasWithFileIds.push({
						position: mediaRecord.position,
						mediaType: mediaRecord.mediaType,
						lowQualityFileId: lowQualityFile.id,
						highQualityFileId: highQualityFile.id,
					});
				}

				return transaction.post.create({
					data: {
						id: postId,
						authorId: authenticatedUserId,
						text,
						medias: { create: mediasWithFileIds },
					},
					include: {
						medias: { orderBy: { position: "asc" } },
					},
				});
			});
		} catch (error) {
			await Promise.allSettled(
				uploadedFiles.map((fileName) => deleteFile({ fileName })),
			);
			throw error;
		}
		const [postToSend] = await hydratePostMediaFiles([createdPost]);
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
