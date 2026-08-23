const bookmarkCollectionsRootQueryKey = ["bookmark-collections"] as const;

const bookmarkCollectionsQueryKeys = {
	root: bookmarkCollectionsRootQueryKey,
	mine: (limit = 10) =>
		[...bookmarkCollectionsRootQueryKey, "me", { limit }] as const,
};

export { bookmarkCollectionsQueryKeys };
