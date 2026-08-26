import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import type { Comment } from "../common/comment.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";

type CreateCommentInput = {
	postId: string;
	parentCommentId?: string;
	content: string;
};

type CreateCommentResponse = {
	message: string;
	comment: Comment;
};

const createComment = async (input: CreateCommentInput): Promise<Comment> => {
	const formData = new FormData();
	formData.append("postId", input.postId);
	if (input.parentCommentId) {
		formData.append("parentCommentId", input.parentCommentId);
	}
	if (input.content) {
		formData.append("content", input.content);
	}

	const response = await httpClient
		.post("comments", {
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
			if (comment.parentId) {
				queryClient.invalidateQueries({
					queryKey: commentListQueryKeys.replies(comment.parentId),
				});
			}
		},
	});
};

export { useCreateComment };
