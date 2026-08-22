import type { User } from "../../common/user.ts";

type UseAuthenticatedUserQueryData = {
	id: User["id"];
	fullName: User["fullName"];
	username: User["username"];
	lowQualityProfilePictureFile?: User["lowQualityProfilePictureFile"];
	bestQualityProfilePictureFile?: User["bestQualityProfilePictureFile"];
	followersCount?: User["followersCount"];
	followingCount?: User["followingCount"];
};

export type { UseAuthenticatedUserQueryData };
