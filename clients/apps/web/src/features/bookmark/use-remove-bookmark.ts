import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKey } from "@/features/post/post-detail/post-detail.query-key.ts";
import {
	updateBookmarkInQueryData,
	updatePostBookmarkState,
} from "./common/bookmark.cache-utils.ts";

const useRemoveBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (postId: string) =>
			httpClient
				.delete(`posts/${postId}/bookmarks`)
				.json<{ success: boolean }>(),
		onMutate: async (postId) => {
			await queryClient.cancelQueries({ queryKey: postListQueryKeys.root });
			const previousQueries = queryClient.getQueriesData({
				queryKey: postListQueryKeys.root,
			});
			const previousPost = queryClient.getQueryData<Post>(
				postDetailsQueryKey.build(postId),
			);
			queryClient.setQueriesData({ queryKey: postListQueryKeys.root }, (data) =>
				updateBookmarkInQueryData(data, postId, false),
			);
			queryClient.setQueryData<Post>(
				postDetailsQueryKey.build(postId),
				(post) => (post ? updatePostBookmarkState(post, false) : post),
			);
			return { previousQueries, previousPost };
		},
		onError: (_error, postId, context) => {
			for (const [queryKey, data] of context?.previousQueries ?? []) {
				queryClient.setQueryData(queryKey, data);
			}
			queryClient.setQueryData(
				postDetailsQueryKey.build(postId),
				context?.previousPost,
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.bookmarks(),
			});
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.root,
				predicate: (query) => query.queryKey.includes("collection"),
			});
		},
	});
};

export { useRemoveBookmark };
