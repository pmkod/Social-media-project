import type { Comment } from "../common/comment.ts";

type CommentDetailResponse = {
	comment: Comment;
	parentComments: Comment[];
};

function updateCommentInDetail(
	detail: CommentDetailResponse,
	commentId: string,
	update: (comment: Comment) => Comment,
): CommentDetailResponse {
	return {
		comment:
			detail.comment.id === commentId ? update(detail.comment) : detail.comment,
		parentComments: detail.parentComments.map((comment) =>
			comment.id === commentId ? update(comment) : comment,
		),
	};
}

export type { CommentDetailResponse };
export { updateCommentInDetail };
