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

const fetchCommentsPage = async ({
	postId,
	parentCommentId,
	pageParam = 1,
}: {
	postId: string;
	parentCommentId?: string;
	pageParam?: number;
}): Promise<CommentsInfiniteResult> => {
	const searchParams = new URLSearchParams({
		postId,
		page: pageParam.toString(),
		limit: "5",
	});
	if (parentCommentId) {
		searchParams.set("parentCommentId", parentCommentId);
	}

	return await httpClient
		.get("comments", {
			searchParams,
		})
		.json<CommentsResponse>();
};

type UseCommentsParams = {
	postId: string;
	parentCommentId?: string;
	enabled?: boolean;
};

export const useComments = ({
	postId,
	parentCommentId,
	enabled = true,
}: UseCommentsParams) => {
	return useInfiniteQuery({
		queryKey: commentListQueryKeys.build({ postId, parentCommentId }),
		queryFn: ({ pageParam }) =>
			fetchCommentsPage({ postId, parentCommentId, pageParam }),
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
