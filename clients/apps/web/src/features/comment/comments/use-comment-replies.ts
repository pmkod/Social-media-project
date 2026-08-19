import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";
import type { CommentsResponse } from "./use-comments.ts";

const fetchCommentRepliesPage = async ({
	commentId,
	pageParam = 1,
}: {
	commentId: string;
	pageParam?: number;
}) => {
	return await httpClient
		.get(`comments/${commentId}/replies`, {
			searchParams: { page: pageParam.toString(), limit: "10" },
		})
		.json<CommentsResponse>();
};

const useCommentReplies = (commentId: string, enabled = true) => {
	return useInfiniteQuery({
		queryKey: commentListQueryKeys.replies(commentId),
		queryFn: ({ pageParam }) =>
			fetchCommentRepliesPage({ commentId, pageParam }),
		initialPageParam: 1,
		enabled: enabled && Boolean(commentId),
		getNextPageParam: (lastPage) =>
			lastPage.pagination.page < lastPage.pagination.totalPages
				? lastPage.pagination.page + 1
				: undefined,
	});
};

export { useCommentReplies };
