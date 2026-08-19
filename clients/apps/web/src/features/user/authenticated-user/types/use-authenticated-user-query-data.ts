import type { User } from "../../common/user.ts";

type UseAuthenticatedUserQueryData = {
	id: User["id"];
	fullName: User["fullName"];
	username: User["username"];
	avatarUrl?: User["avatarUrl"];
	followersCount?: User["followersCount"];
	followingCount?: User["followingCount"];
};

export type { UseAuthenticatedUserQueryData };
