import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import {
	deleteStoryMediaFile,
	setStoryMediaFile,
} from "../services/story-media-storage.service";
import {
	StoriesRoutesTag,
	StoryLifetimeMs,
	StoryMediaTypes,
} from "../stories.constants";
import { CreateStoryRequestBody } from "../stories.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/stories",
	middleware: [requireUserAuthentication],
	summary: "Create a story",
	tags: [StoriesRoutesTag],
	request: {
		body: {
			content: {
				"multipart/form-data": { schema: CreateStoryRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			content: {
				"application/json": {
					schema: z.object({ message: z.string(), story: z.object() }),
				},
			},
			description: "Created story",
		},
	},
});

const extensionByMimeType: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"video/mp4": "mp4",
	"video/webm": "webm",
	"video/ogg": "ogg",
};

const createStoryRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");

		const { media } = c.req.valid("form");
		const storyId = crypto.randomUUID();
		const extension = extensionByMimeType[media.type];
		if (!extension) throw new Error("Unsupported story media type");

		const filename = `story_${storyId}.${extension}`;
		try {
			await setStoryMediaFile({ file: media, filename });
			const createdStory = await prisma.story.create({
				data: {
					id: storyId,
					authorId: authenticatedUserId,
					mediaType: media.type.startsWith("video/")
						? StoryMediaTypes.VIDEO
						: StoryMediaTypes.IMAGE,
					mediaFile: {
						create: { filename, mimeType: media.type },
					},
					expiresAt: new Date(Date.now() + StoryLifetimeMs),
				},
				include: { mediaFile: true },
			});

			const authors = await userServiceClient.fetchAuthorsBatch(
				[authenticatedUserId],
				authenticatedUserId,
			);

			return c.json(
				{
					message: "Story published",
					story: {
						...createdStory,
						author: authors.get(authenticatedUserId) ?? null,
						isViewedByAuthenticatedUser: true,
					},
				},
				HttpStatus.CREATED.code,
			);
		} catch (error) {
			await deleteStoryMediaFile(filename).catch(() => undefined);
			throw error;
		}
	},
});

export { createStoryRoute };
