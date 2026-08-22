const postDetailsRootQueryKey = ["post-details"];

const postDetailsQueryKey = {
	root: postDetailsRootQueryKey,
	build: (postId: string) => [...postDetailsRootQueryKey, postId],
	buildComments: (postId: string) => [
		...postDetailsRootQueryKey,
		postId,
		"comments",
	],
};

export { postDetailsQueryKey };
