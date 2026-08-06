import type { PostAuthor, PostMediaItem } from "./post.ts";

export interface Comment {
	id: string;
	postId: string;
	author: PostAuthor;
	content: string;
	createdAt: string;
	medias?: PostMediaItem[];
	likesCount?: number;
}
