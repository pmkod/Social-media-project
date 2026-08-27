const searchRootQueryKey = ["search"] as const;
const searchHistoryRootQueryKey = [...searchRootQueryKey, "history"] as const;

const searchQueryKeys = {
	root: searchRootQueryKey,
	suggestions: (query: string) =>
		[...searchRootQueryKey, "suggestions", query.trim().toLowerCase()] as const,
	historyRoot: searchHistoryRootQueryKey,
	history: (limit: number) =>
		[...searchHistoryRootQueryKey, { limit }] as const,
};

export { searchQueryKeys };
