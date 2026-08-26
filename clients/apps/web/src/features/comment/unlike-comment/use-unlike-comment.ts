import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Comment } from "../common/comment.ts";
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
											isLikedByAuthenticatedUser: false,
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

export { useUnlikeComment };
