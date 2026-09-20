export const DiscussionTypes = {
	DIRECT: "DIRECT",
	GROUP: "GROUP",
} as const;

export const MESSAGE_IMAGE_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;
export const MESSAGE_IMAGE_MAX_FILE_SIZE = 20_000_000;
export const MESSAGE_IMAGE_MAX_COUNT = 4;

export type DiscussionType =
	(typeof DiscussionTypes)[keyof typeof DiscussionTypes];
