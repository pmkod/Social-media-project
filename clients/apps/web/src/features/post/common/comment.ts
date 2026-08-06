import type { PostAuthor } from "./post.ts";

export interface Comment {
	id: string;
	postId: string;
	author: PostAuthor;
	content: string;
	createdAt: string;
	likesCount?: number;
}
