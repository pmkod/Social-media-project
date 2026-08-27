type User = {
	id: string;
	fullName: string;
	username: string;
	email?: string;
	bio?: string | null;
	lowQualityProfilePictureFile?: UserProfileMediaFile | null;
	bestQualityProfilePictureFile?: UserProfileMediaFile | null;
	lowQualityCoverPictureFile?: UserProfileMediaFile | null;
	bestQualityCoverPictureFile?: UserProfileMediaFile | null;
	postCount?: number;
	followersCount?: number;
	followingCount?: number;
	unseenNotificationsCount?: number;
	createdAt?: string | null;
	isFollowedByAuthenticatedUser?: boolean;
	isBlockedByAuthenticatedUser?: boolean;
	hasBlockedAuthenticatedInUser?: boolean;
};

type UserProfileMediaFile = {
	id: string;
	filename: string;
};

export type { User };
