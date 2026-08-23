import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";
import type { Comment } from "../common/comment.ts";

type CreateCommentInput = {
	postId: string;
	content: string;
};

type CreateCommentResponse = {
	message: string;
	comment: Comment;
};

const createComment = async (input: CreateCommentInput): Promise<Comment> => {
	const formData = new FormData();
	if (input.content) {
		formData.append("content", input.content);
	}

	const response = await httpClient
		.post(`posts/${input.postId}/comments`, {
			body: formData,
		})
		.json<CreateCommentResponse>();

	return response.comment;
};

const useCreateComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createComment,
		onSuccess: (comment) => {
			// queryClient.invalidateQueries({ queryKey: postsQueryKey.root });
			queryClient.invalidateQueries({ queryKey: postListQueryKeys.root });
			queryClient.invalidateQueries({
				queryKey: commentListQueryKeys.postComments(comment.postId),
			});
		},
	});
};

export { useCreateComment };
