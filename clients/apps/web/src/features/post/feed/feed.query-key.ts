const feedRootQueryKey = ["feed"];

const feedQueryKey = {
	root: feedRootQueryKey,
	build: () => feedRootQueryKey,
	buildFollowing: () => [...feedRootQueryKey, "following"],
};

export { feedQueryKey };
