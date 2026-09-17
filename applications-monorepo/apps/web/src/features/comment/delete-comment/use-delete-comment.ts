import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKeys } from "@/features/post/post-detail/post-detail.query-keys.ts";
import * as m from "@/paraglide/messages.js";
import { commentDetailsQueryKeys } from "../comment-detail/comment-detail.query-keys.ts";
import type { CommentDetailResponse } from "../comment-detail/comment-detail.ts";
import { updateCommentInDetail } from "../comment-detail/comment-detail.ts";
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
			queryClient.setQueriesData<CommentDetailResponse>(
				{ queryKey: commentDetailsQueryKeys.root },
				(data) =>
					data &&
					updateCommentInDetail(data, comment.id, (cachedComment) => ({
						...cachedComment,
						content: "",
						exists: false,
						isDeleted: true,
						isLikedByAuthenticatedUser: false,
					})),
			);
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
			toast.success(m.comment_delete_success());
		},
		onError: (error) => {
			toast.error(error.message || m.comment_delete_error());
		},
	});
};

export { useDeleteComment };
