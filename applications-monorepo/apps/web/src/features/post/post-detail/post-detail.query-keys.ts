const postDetailsRootQueryKey = ["post-details"];

const postDetailsQueryKeys = {
	root: postDetailsRootQueryKey,
	build: (postId: string) => [...postDetailsRootQueryKey, postId],
	buildComments: (postId: string) => [
		...postDetailsRootQueryKey,
		postId,
		"comments",
	],
};

export { postDetailsQueryKeys };
