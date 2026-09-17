import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { commentDetailsQueryKeys } from "./comment-detail.query-keys.ts";
import type { CommentDetailResponse } from "./comment-detail.ts";

function useCommentDetail({
	postId,
	commentId,
}: {
	postId: string;
	commentId: string;
}) {
	return useQuery({
		queryKey: commentDetailsQueryKeys.build({ postId, commentId }),
		queryFn: () =>
			httpClient
				.get(`posts/${postId}/comments/${commentId}`)
				.json<CommentDetailResponse>(),
		enabled: Boolean(postId && commentId),
	});
}

export { useCommentDetail };
