const bookmarkCollectionsRootQueryKey = ["bookmark-collections"] as const;

const bookmarkCollectionsQueryKeys = {
	root: bookmarkCollectionsRootQueryKey,
	mine: () => [...bookmarkCollectionsRootQueryKey, "me"] as const,
};

export { bookmarkCollectionsQueryKeys };
