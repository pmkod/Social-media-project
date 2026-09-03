const StoriesRoutesTag = "Stories";

const StoryMediaTypes = {
	IMAGE: "IMAGE",
	VIDEO: "VIDEO",
} as const;

const StoryMaxFileSize = 20_000_000;
const StoryLifetimeMs = 24 * 60 * 60 * 1000;

export { StoriesRoutesTag, StoryMediaTypes, StoryMaxFileSize, StoryLifetimeMs };
