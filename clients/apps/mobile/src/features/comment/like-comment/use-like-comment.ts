import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { Comment } from "../common/comment";
import { commentListQueryKeys } from "../common/comment-list.query-keys";

type LikeCommentResponse = {
	message: string;
	likesCount: number;
};

export const useLikeComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) =>
			httpClient
				.post(`comments/${commentId}/likes`)
				.json<LikeCommentResponse>(),
		onSuccess: (response, commentId) => {
			queryClient.setQueriesData<InfiniteData<{ data: Comment[] }>>(
				{ queryKey: commentListQueryKeys.root, exact: false },
				(oldData) => {
					if (!oldData) return undefined;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							data: page.data.map((comment) =>
								comment.id === commentId
									? {
											...comment,
											likesCount: response.likesCount,
											isLikedByAuthenticatedUser: true,
										}
									: comment,
							),
						})),
					};
				},
			);
		},
	});
};
