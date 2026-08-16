const userConnectionsRootQueryKey = ["user-connections"] as const;

const userConnectionsQueryKeys = {
	root: userConnectionsRootQueryKey,
	followers: (userId: string) =>
		[...userConnectionsRootQueryKey, userId, "followers"] as const,
	following: (userId: string) =>
		[...userConnectionsRootQueryKey, userId, "following"] as const,
};

export { userConnectionsQueryKeys };
