import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { PostListPage } from "@/features/post/common/post-cache.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import type { BookmarkCollectionsResponse } from "../common/bookmark-collection.ts";
import { bookmarkCollectionsQueryKeys } from "../common/bookmark-collections.query-keys.ts";

const useDeleteBookmarkCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (collectionId: string) =>
			httpClient
				.delete(`collections/${collectionId}`)
				.json<{ message: string; unbookmarkedPostIds: string[] }>(),
		onSuccess: ({ unbookmarkedPostIds }, collectionId) => {
			queryClient.setQueriesData<InfiniteData<BookmarkCollectionsResponse>>(
				{ queryKey: bookmarkCollectionsQueryKeys.root },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							bookmarkCollections: page.bookmarkCollections.filter(
								(collection) => collection.id !== collectionId,
							),
						})),
					},
			);

			const unbookmarkedPostIdsSet = new Set(unbookmarkedPostIds);
			queryClient.setQueriesData<InfiniteData<PostListPage>>(
				{ queryKey: postListQueryKeys.root },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							posts: page.posts.map((post) =>
								unbookmarkedPostIdsSet.has(post.id)
									? {
											...post,
											isBookmarkedByAuthenticatedUser: false,
										}
									: post,
							),
						})),
					},
			);

			queryClient.setQueryData<InfiniteData<PostListPage>>(
				postListQueryKeys.bookmarks({}),
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							posts: page.posts.filter(
								(post) => !unbookmarkedPostIdsSet.has(post.id),
							),
						})),
					},
			);

			queryClient.setQueryData<InfiniteData<PostListPage>>(
				postListQueryKeys.bookmarks({ bookmarkCollectionId: collectionId }),
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							posts: [],
							pagination: {
								...page.pagination,
								nextCursor: null,
								hasNextPage: false,
							},
						})),
					},
			);
		},
	});
};

export { useDeleteBookmarkCollection };
