import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { Post } from "@/features/post/common/post";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys";
import { postDetailsQueryKeys } from "@/features/post/post-detail/post-detail.query-keys";
import type { Comment } from "../common/comment";
import { commentListQueryKeys } from "../common/comment-list.query-keys";

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
		.post("comments", {
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
			queryClient.invalidateQueries({
				queryKey: commentListQueryKeys.build({
					postId: comment.postId,
					parentCommentId: comment.parentId ?? undefined,
				}),
			});
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
		},
	});
};

export { useCreateComment };
