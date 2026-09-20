const DiscussionTypes = {
	PRIVATE: "PRIVATE",
	GROUP: "GROUP",
} as const;

const MESSAGE_MAX_LENGTH = 4000;

const MESSAGE_IMAGE_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;
const MESSAGE_IMAGE_MAX_FILE_SIZE = 20_000_000;
const MESSAGE_IMAGE_MAX_COUNT = 4;

export {
	DiscussionTypes,
	MESSAGE_IMAGE_MAX_COUNT,
	MESSAGE_IMAGE_MAX_FILE_SIZE,
	MESSAGE_IMAGE_MIME_TYPES,
	MESSAGE_MAX_LENGTH,
};
