import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { commentDetailsQueryKeys } from "../comment-detail/comment-detail.query-keys.ts";
import type { CommentDetailResponse } from "../comment-detail/comment-detail.ts";
import { updateCommentInDetail } from "../comment-detail/comment-detail.ts";
import type { Comment } from "../common/comment.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";

type LikeCommentResponse = {
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
		onSuccess: (response, commentId) => {
			queryClient.setQueriesData<CommentDetailResponse>(
				{ queryKey: commentDetailsQueryKeys.root },
				(data) =>
					data &&
					updateCommentInDetail(data, commentId, (comment) => ({
						...comment,
						likesCount: response.likesCount,
						isLikedByAuthenticatedUser: true,
					})),
			);
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

export { useLikeComment };
