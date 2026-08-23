import type { User } from "@/features/user/common/user";

type PostFileItem = {
	id?: string;
	mimeType?: string | null;
	filename: string;
	createdAt?: string;
	url?: string;
};

export type PostMediaItem = {
	id?: string;
	postId?: string;
	position?: number;
	mediaType?: string;
	createdAt?: string;
	lowQualityFileId?: string | null;
	highQualityFileId?: string | null;
	lowQualityFile?: PostFileItem | null;
	highQualityFile?: PostFileItem | null;
};

export type Post = {
	id: string;
	author: User;
	text?: string;
	content?: string;
	medias?: PostMediaItem[];
	likesCount?: number;
	commentsCount?: number;
	isLikedByAuthenticatedUser?: boolean;
	isBookmarkedByAuthenticatedUser?: boolean;
	createdAt: string;
	updatedAt?: string;
};
