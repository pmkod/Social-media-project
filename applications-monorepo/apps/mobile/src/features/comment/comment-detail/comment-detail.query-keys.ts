const commentDetailsRootQueryKey = ["comment-details"] as const;

const commentDetailsQueryKeys = {
	root: commentDetailsRootQueryKey,
	build: (commentId: string) =>
		[...commentDetailsRootQueryKey, commentId] as const,
};

export { commentDetailsQueryKeys };
