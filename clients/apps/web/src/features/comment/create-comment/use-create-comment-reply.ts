import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";
import type { Comment } from "../common/comment.ts";

type CreateCommentReplyInput = {
	comment: Comment;
	content: string;
};

type CreateCommentReplyResponse = {
	message: string;
	comment: Comment;
};

const createCommentReply = async ({
	comment,
	content,
}: CreateCommentReplyInput) => {
	const formData = new FormData();
	formData.append("content", content);

	const response = await httpClient
		.post(`comments/${comment.id}/replies`, { body: formData })
		.json<CreateCommentReplyResponse>();

	return response.comment;
};

const useCreateCommentReply = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createCommentReply,
		onSuccess: (reply, input) => {
			const rootCommentId = input.comment.parentId ?? input.comment.id;
			// queryClient.invalidateQueries({ queryKey: postsQueryKey.root });
			// queryClient.invalidateQueries({ queryKey: postListQueryKeys.root });
			// queryClient.invalidateQueries({
			// 	queryKey: commentListQueryKeys.postComments(reply.postId),
			// });
			// queryClient.invalidateQueries({
			// 	queryKey: commentListQueryKeys.replies(rootCommentId),
			// });
		},
	});
};

export { useCreateCommentReply };
