import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Comment } from "../common/comment.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";

export type CommentsResponse = {
	data: Comment[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

export type CommentsInfiniteResult = {
	data: Comment[];
	pagination: CommentsResponse["pagination"];
};

export type GetCommentsResponse = CommentsResponse;
export type GetCommentsInfiniteResult = CommentsInfiniteResult;

export const fetchCommentsPage = async ({
	postId,
	pageParam = 1,
}: {
	postId: string;
	pageParam?: number;
}): Promise<CommentsInfiniteResult> => {
	const searchParams = new URLSearchParams({
		page: pageParam.toString(),
		limit: "10",
	});

	const res = await httpClient
		.get(`posts/${postId}/comments`, {
			searchParams,
		})
		.json<CommentsResponse>();

	return {
		data: res.data ?? [],
		pagination: res.pagination,
	};
};

type UseCommentsParams = {
	postId: string;
	enabled?: boolean;
};

export const useComments = ({ postId, enabled = true }: UseCommentsParams) => {
	return useInfiniteQuery({
		queryKey: commentListQueryKeys.postComments(postId),
		queryFn: ({ pageParam }) => fetchCommentsPage({ postId, pageParam }),
		initialPageParam: 1,
		enabled: enabled && Boolean(postId),
		getNextPageParam: (lastPage) => {
			if (lastPage.pagination.page < lastPage.pagination.totalPages) {
				return lastPage.pagination.page + 1;
			}
			return undefined;
		},
	});
};
