import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKey } from "@/features/post/post-detail/post-detail.query-key.ts";
import {
	updateBookmarkInQueryData,
	updatePostBookmarkState,
} from "./common/bookmark.cache-utils.ts";
import { bookmarkCollectionQueryKeys } from "./common/bookmark-collection.query-keys.ts";

type AddBookmarkInput = {
	postId: string;
	collectionId?: string;
};

const useAddBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, collectionId }: AddBookmarkInput) =>
			httpClient
				.post(`posts/${postId}/bookmarks`, {
					json: collectionId ? { collectionId } : {},
				})
				.json<{ success: boolean }>(),
		onMutate: async ({ postId }) => {
			await queryClient.cancelQueries({ queryKey: postListQueryKeys.root });
			const previousQueries = queryClient.getQueriesData({
				queryKey: postListQueryKeys.root,
			});
			const previousPost = queryClient.getQueryData<Post>(
				postDetailsQueryKey.build(postId),
			);
			queryClient.setQueriesData({ queryKey: postListQueryKeys.root }, (data) =>
				updateBookmarkInQueryData(data, postId, true),
			);
			queryClient.setQueryData<Post>(
				postDetailsQueryKey.build(postId),
				(post) => (post ? updatePostBookmarkState(post, true) : post),
			);
			return { previousQueries, previousPost };
		},
		onError: (_error, input, context) => {
			for (const [queryKey, data] of context?.previousQueries ?? []) {
				queryClient.setQueryData(queryKey, data);
			}
			queryClient.setQueryData(
				postDetailsQueryKey.build(input.postId),
				context?.previousPost,
			);
		},
		onSuccess: (_response, input) => {
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.bookmarks(),
			});
			if (input.collectionId) {
				queryClient.invalidateQueries({
					queryKey: postListQueryKeys.collectionPosts(input.collectionId),
				});
				queryClient.invalidateQueries({
					queryKey: bookmarkCollectionQueryKeys.root,
				});
			}
		},
	});
};

export { useAddBookmark };
