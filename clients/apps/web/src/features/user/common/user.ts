type User = {
	id: string;
	fullName: string;
	username: string;
	email?: string;
	bio?: string | null;
	avatarUrl?: string | null;
	coverUrl?: string | null;
	postCount?: number;
	followersCount?: number;
	followingCount?: number;
	createdAt?: string | null;
	isFollowedByAuthenticatedUser?: boolean;
	isBlockedByAuthenticatedUser?: boolean;
	hasBlockedAuthenticatedInUser?: boolean;
};

export type { User };
