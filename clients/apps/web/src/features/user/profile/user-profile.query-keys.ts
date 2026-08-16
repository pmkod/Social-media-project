const userProfileRootQueryKey = ["user-profile"] as const;

const userProfileQueryKeys = {
	root: userProfileRootQueryKey,
	byUsername: (username: string) =>
		[...userProfileRootQueryKey, username.toLowerCase()] as const,
};

export { userProfileQueryKeys };
