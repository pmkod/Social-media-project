import type { PostAuthor } from "./post.ts";

export type Comment = {
	id: string;
	postId: string;
	authorId?: string;
	author?: PostAuthor | null;
	content: string;
	createdAt: string;
	updatedAt?: string;
	likesCount?: number;
};
