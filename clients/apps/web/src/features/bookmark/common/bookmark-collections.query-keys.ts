const bookmarkCollectionsRootQueryKey = ["bookmark-collections"] as const;

type BookmarkCollectionsQueryParams = {
	limit: number;
	q: string;
};

const bookmarkCollectionsQueryKeys = {
	root: bookmarkCollectionsRootQueryKey,
	mine: (params: BookmarkCollectionsQueryParams) =>
		[...bookmarkCollectionsRootQueryKey, "me", params] as const,
};

export { bookmarkCollectionsQueryKeys };
export type { BookmarkCollectionsQueryParams };
