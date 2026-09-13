import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { updatePostInCache } from "@/features/post/common/post-cache.ts";
import {
	prependCommentToCache,
	updateCommentInCache,
} from "../common/comment-cache.ts";
import type { Comment } from "../common/comment.ts";

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
			updatePostInCache(queryClient, comment.postId, (post) => ({
				...post,
				commentsCount: (post.commentsCount ?? 0) + 1,
			}));
			prependCommentToCache(queryClient, comment);

			if (comment.parentId) {
				updateCommentInCache(queryClient, comment.parentId, (parent) => ({
					...parent,
					repliesCount: (parent.repliesCount ?? 0) + 1,
				}));
			}
		},
	});
};

export { useCreateComment };
