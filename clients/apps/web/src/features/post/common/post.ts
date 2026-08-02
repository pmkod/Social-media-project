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

export interface Post {
	id: string;
	author: PostAuthor;
	createdAt: string;
	content: string;
	images?: string[];
	mediaUrls?: string[];
	stats: PostStats;
	isLiked?: boolean;
	isBookmarked?: boolean;
}
