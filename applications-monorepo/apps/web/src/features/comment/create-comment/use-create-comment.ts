import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKeys } from "@/features/post/post-detail/post-detail.query-keys.ts";
import { commentDetailsQueryKeys } from "../comment-detail/comment-detail.query-keys.ts";
import type { CommentDetailResponse } from "../comment-detail/comment-detail.ts";
import { updateCommentInDetail } from "../comment-detail/comment-detail.ts";
import type { Comment } from "../common/comment.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";

type PostListPage = { posts: Post[] };
type CommentListPage = {
	data: Comment[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

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
		.post("content/create-comment", {
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
											commentsCount: (post.commentsCount ?? 0) + 1,
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
									commentsCount: (data.post.commentsCount ?? 0) + 1,
								},
							}
						: data,
			);
			queryClient.setQueryData<InfiniteData<CommentListPage>>(
				commentListQueryKeys.build({
					postId: comment.postId,
					parentCommentId: comment.parentId ?? undefined,
				}),
				(data) => {
					if (!data?.pages.length) return data;
					const comments = [
						comment,
						...data.pages
							.flatMap((page) => page.data)
							.filter((item) => item.id !== comment.id),
					];
					const firstPage = data.pages[0];
					if (!firstPage) return data;
					const limit = firstPage.pagination.limit;
					const total = firstPage.pagination.total + 1;
					const totalPages = Math.ceil(total / limit);

					return {
						...data,
						pages: data.pages.map((page, index) => ({
							...page,
							data: comments.slice(index * limit, (index + 1) * limit),
							pagination: {
								...page.pagination,
								total,
								totalPages,
							},
						})),
					};
				},
			);

			const parentCommentId = comment.parentId;
			if (parentCommentId) {
				queryClient.setQueriesData<CommentDetailResponse>(
					{ queryKey: commentDetailsQueryKeys.root },
					(data) =>
						data &&
						updateCommentInDetail(data, parentCommentId, (parent) => ({
							...parent,
							repliesCount: (parent.repliesCount ?? 0) + 1,
						})),
				);
				queryClient.setQueriesData<InfiniteData<CommentListPage>>(
					{ queryKey: commentListQueryKeys.root },
					(data) =>
						data && {
							...data,
							pages: data.pages.map((page) => ({
								...page,
								data: page.data.map((parent) =>
									parent.id === parentCommentId
										? {
												...parent,
												repliesCount: (parent.repliesCount ?? 0) + 1,
											}
										: parent,
								),
							})),
						},
				);
			}
		},
	});
};

export { useCreateComment };
