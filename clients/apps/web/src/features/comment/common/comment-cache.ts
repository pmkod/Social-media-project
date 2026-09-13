import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { commentListQueryKeys } from "./comment-list.query-keys.ts";
import type { Comment } from "./comment.ts";

type CommentListPage = {
	data: Comment[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

const updateCommentInCache = (
	queryClient: QueryClient,
	commentId: string,
	updater: (comment: Comment) => Comment,
) => {
	queryClient.setQueriesData<InfiniteData<CommentListPage>>(
		{ queryKey: commentListQueryKeys.root },
		(data) =>
			data && {
				...data,
				pages: data.pages.map((page) => ({
					...page,
					data: page.data.map((comment) =>
						comment.id === commentId ? updater(comment) : comment,
					),
				})),
			},
	);
};

const prependCommentToCache = (
	queryClient: QueryClient,
	comment: Comment,
) => {
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
};

export { prependCommentToCache, updateCommentInCache };
