import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Comment } from "../common/comment.ts";
import { feedQueryKey } from "../feed/feed.query-key.ts";
import { postDetailsQueryKey } from "../post-detail/post-detail.query-key.ts";
import { postsQueryKey } from "../posts.query-key.ts";

export type CreateCommentInput = {
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
			queryClient.invalidateQueries({ queryKey: postsQueryKey.root });
			queryClient.invalidateQueries({ queryKey: feedQueryKey.root });
			queryClient.invalidateQueries({
				queryKey: postDetailsQueryKey.buildComments(comment.postId),
			});
		},
	});
};

export { useCreateComment };
