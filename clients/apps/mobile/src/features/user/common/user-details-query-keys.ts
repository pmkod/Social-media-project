const userDetailsRootQueryKey = ["user-details"] as const;

const userDetailsQueryKeys = {
	root: userDetailsRootQueryKey,
	byUsername: (username: string) =>
		[...userDetailsRootQueryKey, username.toLowerCase()] as const,
};

export { userDetailsQueryKeys };
