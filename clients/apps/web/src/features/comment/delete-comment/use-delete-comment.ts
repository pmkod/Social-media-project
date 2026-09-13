import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKey } from "@/features/post/post-detail/post-detail.query-key.ts";
import type { Comment } from "../common/comment.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";

type PostListPage = { posts: Post[] };
type CommentListPage = { data: Comment[] };

const useDeleteComment = () => {
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
											isDeleted: true,
											isLikedByAuthenticatedUser: false,
											likesCount: 0,
										}
									: cachedComment,
							),
						})),
					},
			);
			queryClient.setQueriesData<InfiniteData<PostListPage>>(
				{ queryKey: postListQueryKeys.root },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							posts: page.posts.map((post) =>
								post.id === comment.postId
									? {
											...post,
											commentsCount: Math.max(0, (post.commentsCount ?? 0) - 1),
										}
									: post,
							),
						})),
					},
			);
			queryClient.setQueryData<{ post: Post }>(
				postDetailsQueryKey.build(comment.postId),
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

export { useDeleteComment };
