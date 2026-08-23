import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKey } from "@/features/post/post-detail/post-detail.query-key.ts";
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys.ts";

type RemoveBookmarkResponse = {
	success: boolean;
	post: Pick<Post, "id"> & {
		isBookmarkedByAuthenticatedUser: boolean;
	};
};

const useRemoveBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (postId: string) =>
			httpClient
				.delete(`posts/${postId}/bookmarks`)
				.json<RemoveBookmarkResponse>(),
		onSuccess: (data, postId) => {
			const isBookmarked = data.post.isBookmarkedByAuthenticatedUser;

			queryClient.setQueriesData<InfiniteData<{ posts: Post[] }>>(
				{ queryKey: postListQueryKeys.root, exact: false },
				(oldData) => {
					if (!oldData) return undefined;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							posts: page.posts.map((post) =>
								post.id === data.post.id
									? { ...post, isBookmarkedByAuthenticatedUser: isBookmarked }
									: post,
							),
						})),
					};
				},
			);

			queryClient.setQueryData<{ post: Post }>(
				postDetailsQueryKey.build(postId),
				(oldData) =>
					oldData
						? {
								...oldData,
								post: {
									...oldData.post,
									isBookmarkedByAuthenticatedUser: isBookmarked,
								},
							}
						: oldData,
			);

			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.bookmarks(),
			});
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.root,
				predicate: (query) => query.queryKey.includes("collection"),
			});
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
		},
	});
};

export { useRemoveBookmark };
