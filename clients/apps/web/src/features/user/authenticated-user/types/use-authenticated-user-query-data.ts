import type { User } from "../../common/user.ts";

type UseAuthenticatedUserQueryData = {
	id: User["id"];
	fullName: User["fullName"];
	username: User["username"];
	profilePictureUrl?: User["profilePictureUrl"];
	lowQualityProfilePictureUrl?: User["lowQualityProfilePictureUrl"];
	followersCount?: User["followersCount"];
	followingCount?: User["followingCount"];
};

export type { UseAuthenticatedUserQueryData };
