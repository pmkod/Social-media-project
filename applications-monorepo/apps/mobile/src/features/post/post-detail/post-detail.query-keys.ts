const postDetailsRootQueryKey = ["post-details"] as const;

const postDetailsQueryKeys = {
	root: postDetailsRootQueryKey,
	build: (postId: string) => [...postDetailsRootQueryKey, postId] as const,
	buildComments: (postId: string) => [
		...postDetailsRootQueryKey,
		postId,
		"comments",
	] as const,
};

export { postDetailsQueryKeys };
