const commentListRootQueryKey = ["comment-list"] as const;

type CommentListQueryParams = {
	postId: string;
	parentCommentId?: string;
};

const commentListQueryKeys = {
	root: commentListRootQueryKey,
	build: ({ postId, parentCommentId }: CommentListQueryParams) =>
		[
			...commentListRootQueryKey,
			{ postId, parentCommentId: parentCommentId ?? null },
		] as const,
};

export { commentListQueryKeys };
export type { CommentListQueryParams };
