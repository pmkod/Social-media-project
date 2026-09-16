const commentDetailsRootQueryKey = ["comment-details"] as const;

const commentDetailsQueryKeys = {
	root: commentDetailsRootQueryKey,
	build: ({ postId, commentId }: { postId: string; commentId: string }) =>
		[...commentDetailsRootQueryKey, { postId, commentId }] as const,
};

export { commentDetailsQueryKeys };
