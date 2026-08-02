const PostsRoutesTag = "Posts";

const PostMediaTypes = {
	IMAGE: "IMAGE",
	VIDEO: "VIDEO",
} as const;

const PostMediaCompressionFormat = {
	ext: "webp",
	mime: "image/webp",
} as const;

export { PostsRoutesTag, PostMediaTypes, PostMediaCompressionFormat };
