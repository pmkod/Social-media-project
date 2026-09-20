const MessagesRoutesTag = "Messages";

const MessageImageCompressionFormat = {
	extension: "webp",
	mimeType: "image/webp",
} as const;

const MessageImageLimits = {
	maxCount: 4,
	maxFileSize: 20_000_000,
} as const;

const MessageImageMimeTypes = [
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;

export {
	MessageImageCompressionFormat,
	MessageImageLimits,
	MessageImageMimeTypes,
	MessagesRoutesTag,
};
