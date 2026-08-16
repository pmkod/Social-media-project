import type { Comment } from "./comment.ts";

export type PostAuthor = {
	id?: string;
	name: string;
	handle: string;
	avatar: string;
};

export type PostFileItem = {
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
	authorId?: string;
	author?: PostAuthor | null;
	text?: string;
	content?: string;
	medias?: PostMediaItem[];
	likesCount?: number;
	commentsCount?: number;
	isLikedByAuthenticatedUser?: boolean;
	isBookmarkedByAuthenticatedUser?: boolean;
	comments?: Comment[];
	createdAt: string;
	updatedAt?: string;
};
