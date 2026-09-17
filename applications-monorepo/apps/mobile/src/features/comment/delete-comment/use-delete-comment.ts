import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { Post } from "@/features/post/common/post";
import { postDetailsQueryKeys } from "@/features/post/post-detail/post-detail.query-keys";
import type { Comment } from "../common/comment";
import { commentListQueryKeys } from "../common/comment-list.query-keys";

type CommentListPage = { data: Comment[] };

export const useDeleteComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (comment: Comment) =>
			httpClient.delete(`comments/${comment.id}`).json<{ message: string }>(),
		onSuccess: (_, comment) => {
			queryClient.setQueriesData<InfiniteData<CommentListPage>>(
				{ queryKey: commentListQueryKeys.root },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							data: page.data.map((cachedComment) =>
								cachedComment.id === comment.id
									? {
											...cachedComment,
											content: "",
											exists: false,
											isDeleted: true,
											isLikedByAuthenticatedUser: false,
										}
									: cachedComment,
							),
						})),
					},
			);
			queryClient.setQueryData<{ post: Post }>(
				postDetailsQueryKeys.build(comment.postId),
				(data) =>
					data
						? {
								...data,
								post: {
									...data.post,
									commentsCount: Math.max(
										0,
										(data.post.commentsCount ?? 0) - 1,
									),
								},
							}
						: data,
			);
		},
	});
};
