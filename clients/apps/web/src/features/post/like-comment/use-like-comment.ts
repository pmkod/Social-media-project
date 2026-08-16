import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { updateCommentInQueryData } from "../common/comment-like.cache-utils.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";

type LikeCommentResponse = {
	success: boolean;
	message: string;
	likesCount: number;
};

const useLikeComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) =>
			httpClient
				.post(`comments/${commentId}/likes`)
				.json<LikeCommentResponse>(),
		onMutate: async (commentId) => {
			await queryClient.cancelQueries({ queryKey: commentListQueryKeys.root });
			const previousQueries = queryClient.getQueriesData({
				queryKey: commentListQueryKeys.root,
			});
			queryClient.setQueriesData(
				{ queryKey: commentListQueryKeys.root },
				(data) => updateCommentInQueryData(data, commentId, true),
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
					updateCommentInQueryData(data, commentId, true, response.likesCount),
			);
		},
	});
};

export { useLikeComment };
