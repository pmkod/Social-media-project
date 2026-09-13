import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { updatePostInCache } from "@/features/post/common/post-cache.ts";
import { updateCommentInCache } from "../common/comment-cache.ts";
import type { Comment } from "../common/comment.ts";

const useDeleteComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (comment: Comment) =>
			httpClient.delete(`comments/${comment.id}`).json<{ message: string }>(),
		onSuccess: (_, comment) => {
			updateCommentInCache(queryClient, comment.id, (cachedComment) => ({
				...cachedComment,
				content: "",
				isDeleted: true,
				isLikedByAuthenticatedUser: false,
				likesCount: 0,
			}));
			updatePostInCache(queryClient, comment.postId, (post) => ({
				...post,
				commentsCount: Math.max(0, (post.commentsCount ?? 0) - 1),
			}));
		},
	});
};

export { useDeleteComment };
