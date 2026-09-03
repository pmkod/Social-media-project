import { z } from "@hono/zod-openapi";
import { StoryMaxFileSize, StoryMediaTypes } from "./stories.constants";

const StoryMediaFileSchema = z
	.file()
	.mime([
		"image/jpeg",
		"image/png",
		"image/webp",
		"video/mp4",
		"video/webm",
		"video/ogg",
	])
	.min(1)
	.max(StoryMaxFileSize);

const CreateStoryRequestBody = z.object({
	media: StoryMediaFileSchema,
});

const StoryResponseSchema = z.object({
	id: z.string(),
	authorId: z.string(),
	mediaType: z.enum([StoryMediaTypes.IMAGE, StoryMediaTypes.VIDEO]),
	createdAt: z.string(),
	expiresAt: z.string(),
});

export { CreateStoryRequestBody, StoryMediaFileSchema, StoryResponseSchema };
