const userListRootQueryKey = ["user-list"] as const;

const userListQueryKeys = {
	root: userListRootQueryKey,
	followSuggestions: (params: { limit: number }) =>
		[...userListRootQueryKey, "follow-suggestions", params] as const,
};

export { userListQueryKeys, userListRootQueryKey };
