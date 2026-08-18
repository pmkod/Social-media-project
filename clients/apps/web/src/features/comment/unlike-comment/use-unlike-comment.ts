import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { updateCommentInQueryData } from "../common/comment-like.cache-utils.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";

type UnlikeCommentResponse = {
	success: boolean;
	message: string;
	likesCount: number;
};

const useUnlikeComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) =>
			httpClient
				.delete(`comments/${commentId}/likes`)
				.json<UnlikeCommentResponse>(),
		onMutate: async (commentId) => {
			await queryClient.cancelQueries({ queryKey: commentListQueryKeys.root });
			const previousQueries = queryClient.getQueriesData({
				queryKey: commentListQueryKeys.root,
			});
			queryClient.setQueriesData(
				{ queryKey: commentListQueryKeys.root },
				(data) => updateCommentInQueryData(data, commentId, false),
			);
			return { previousQueries };
		},
		onError: (_error, _commentId, context) => {
			for (const [queryKey, data] of context?.previousQueries ?? []) {
				queryClient.setQueryData(queryKey, data);
			}
		},
		onSuccess: (response, commentId) => {
			queryClient.setQueriesData(
				{ queryKey: commentListQueryKeys.root },
				(data) =>
					updateCommentInQueryData(data, commentId, false, response.likesCount),
			);
		},
	});
};

export { useUnlikeComment };
