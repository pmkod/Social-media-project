import type { Comment } from "./comment.ts";

const updateCommentLikeState = (
	comment: Comment,
	isLiked: boolean,
	explicitLikesCount?: number,
): Comment => ({
	...comment,
	isLikedByAuthenticatedUser: isLiked,
	likesCount:
		explicitLikesCount ??
		Math.max(0, (comment.likesCount ?? 0) + (isLiked ? 1 : -1)),
});

const updateComment = (
	comment: Comment,
	commentId: string,
	isLiked: boolean,
	explicitLikesCount?: number,
): Comment => ({
	...(comment.id === commentId
		? updateCommentLikeState(comment, isLiked, explicitLikesCount)
		: comment),
	replies: comment.replies?.map((reply) =>
		reply.id === commentId
			? updateCommentLikeState(reply, isLiked, explicitLikesCount)
			: reply,
	),
});

const updateCommentInQueryData = (
	oldData: unknown,
	commentId: string,
	isLiked: boolean,
	explicitLikesCount?: number,
): unknown => {
	if (!oldData || typeof oldData !== "object") return oldData;
	if (!("pages" in oldData)) return oldData;

	const infiniteData = oldData as {
		pages: Array<{ data?: Comment[] }>;
		pageParams: unknown[];
	};

	return {
		...infiniteData,
		pages: infiniteData.pages.map((page) => ({
			...page,
			data: page.data?.map((comment) =>
				updateComment(comment, commentId, isLiked, explicitLikesCount),
			),
		})),
	};
};

export { updateCommentInQueryData };
