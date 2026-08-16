const postsRootQueryKey = ["posts"];

const postsQueryKey = {
	root: postsRootQueryKey,
	build: () => postsRootQueryKey,
	buildDetails: (postId: string) => [...postsRootQueryKey, postId],
	buildComments: (postId: string) => [...postsRootQueryKey, postId, "comments"],
};

export { postsQueryKey };
