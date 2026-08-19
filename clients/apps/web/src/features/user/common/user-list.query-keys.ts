const userListRootQueryKey = ["user-list"] as const;

const userListQueryKeys = {
	root: userListRootQueryKey,
	followSuggestions: (params: { limit: number }) =>
		[...userListRootQueryKey, "follow-suggestions", params] as const,
	followers: (userId: string) =>
		[...userListRootQueryKey, "followers", userId] as const,
	following: (userId: string) =>
		[...userListRootQueryKey, "following", userId] as const,
};

export { userListQueryKeys, userListRootQueryKey };
