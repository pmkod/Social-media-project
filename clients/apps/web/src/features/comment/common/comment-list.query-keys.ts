const commentListRootQueryKey = ["comment-list"] as const;

const commentListQueryKeys = {
	root: commentListRootQueryKey,
	postComments: (postId: string) =>
		[...commentListRootQueryKey, "post", postId] as const,
	replies: (commentId: string) =>
		[...commentListRootQueryKey, "comment", commentId, "replies"] as const,
};

export { commentListQueryKeys, commentListRootQueryKey };
