type User = {
	id: string;
	fullName: string;
	displayName?: string | null;
	username: string;
	email?: string;
	bio?: string | null;
	avatarUrl?: string | null;
	coverUrl?: string | null;
	location?: string | null;
	website?: string | null;
	postCount?: number;
	followersCount?: number;
	followingCount?: number;
	createdAt?: string | null;
	isOwnProfile?: boolean;
	isFollowedByAuthenticatedUser?: boolean;
	isBlockedByAuthenticatedUser?: boolean;
	hasBlockedAuthenticatedInUser?: boolean;
};

export type { User };
