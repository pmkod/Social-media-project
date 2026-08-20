type User = {
	id: string;
	fullName: string;
	username: string;
	email?: string;
	bio?: string | null;
	profilePictureUrl?: string | null;
	lowQualityProfilePictureUrl?: string | null;
	coverPictureUrl?: string | null;
	lowQualityCoverPictureUrl?: string | null;
	postCount?: number;
	followersCount?: number;
	followingCount?: number;
	createdAt?: string | null;
	isFollowedByAuthenticatedUser?: boolean;
	isBlockedByAuthenticatedUser?: boolean;
	hasBlockedAuthenticatedInUser?: boolean;
};

export type { User };
