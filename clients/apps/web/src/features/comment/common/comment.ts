import type { User } from "@/features/user/common/user.ts";

export type Comment = {
	id: string;
	postId: string;
	authorId?: string;
	parentId?: string | null;
	author: User;
	content: string;
	createdAt: string;
	updatedAt?: string;
	likesCount?: number;
	repliesCount?: number;
	isLikedByAuthenticatedUser?: boolean;
	replies?: Comment[];
};
