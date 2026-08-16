const bookmarkCollectionRootQueryKey = ["bookmark-collections"] as const;

const bookmarkCollectionQueryKeys = {
	root: bookmarkCollectionRootQueryKey,
	mine: () => [...bookmarkCollectionRootQueryKey, "me"] as const,
	user: (userId: string) =>
		[...bookmarkCollectionRootQueryKey, "user", userId] as const,
};

export { bookmarkCollectionQueryKeys };
