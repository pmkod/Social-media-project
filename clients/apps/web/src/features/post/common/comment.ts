import type { PostAuthor } from "./post.ts";

export type Comment = {
	id: string;
	postId: string;
	authorId?: string;
	parentId?: string | null;
	author?: PostAuthor | null;
	content: string;
	createdAt: string;
	updatedAt?: string;
	likesCount?: number;
	repliesCount?: number;
	isLikedByAuthenticatedUser?: boolean;
	replies?: Comment[];
};
