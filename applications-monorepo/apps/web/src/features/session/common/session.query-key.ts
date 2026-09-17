const activeSessionsRootQueryKey = ["sessions"] as const;

const activeSessionsQueryKey = {
	root: activeSessionsRootQueryKey,
	build: () => [...activeSessionsRootQueryKey, "active"] as const,
};

export { activeSessionsQueryKey };
