type User = {
	id: string;
	fullName: string | null;
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
	createdAt?: string;
	isOwnProfile?: boolean;
	isFollowedByAuthenticatedUser?: boolean;
};

export type { User };
