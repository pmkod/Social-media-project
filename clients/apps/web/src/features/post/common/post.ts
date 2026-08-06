import type { Comment } from "./comment.ts";

export interface PostAuthor {
	name: string;
	handle: string;
	avatar: string;
}

export interface PostStats {
	comments: number;
	reposts: number;
	likes: number;
	shares: number;
}

export interface PostFileItem {
	id?: string;
	mimeType?: string | null;
	filename: string;
	createdAt?: string;
	url?: string;
}

export interface PostMediaItem {
	id?: string;
	postId?: string;
	position?: number;
	mediaType?: string;
	createdAt?: string;
	lowQualityFileId?: string | null;
	highQualityFileId?: string | null;
	lowQualityFile?: PostFileItem | null;
	highQualityFile?: PostFileItem | null;
}

export interface Post {
	id: string;
	author: PostAuthor;
	createdAt: string;
	content: string;
	medias?: PostMediaItem[];
	stats: PostStats;
	isLiked?: boolean;
	isBookmarked?: boolean;
	comments?: Comment[];
}
