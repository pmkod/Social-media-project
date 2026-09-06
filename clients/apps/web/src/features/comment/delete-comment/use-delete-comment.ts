import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKey } from "@/features/post/post-detail/post-detail.query-key.ts";
import { commentListQueryKeys } from "../common/comment-list.query-keys.ts";

const useDeleteComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) =>
			httpClient.delete(`comments/${commentId}`).json<{ message: string }>(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postDetailsQueryKey.root });
			queryClient.invalidateQueries({ queryKey: commentListQueryKeys.root });
			queryClient.invalidateQueries({ queryKey: postListQueryKeys.root });
		},
	});
};

export { useDeleteComment };
