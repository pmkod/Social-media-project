const CommentsRoutesTag = "Comments";

const CommentMediaTypes = {
	IMAGE: "IMAGE",
	VIDEO: "VIDEO",
} as const;

const CommentMediaCompressionFormat = {
	ext: "webp",
	mime: "image/webp",
} as const;

export { CommentsRoutesTag, CommentMediaTypes, CommentMediaCompressionFormat };
