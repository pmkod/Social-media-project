import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKeys } from "@/features/post/post-detail/post-detail.query-keys.ts";
import type { BookmarkCollectionsResponse } from "../common/bookmark-collection.ts";
import { bookmarkCollectionsQueryKeys } from "../common/bookmark-collections.query-keys.ts";

type PostListPage = {
	posts: Post[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: { id: string; createdAt: string } | null;
	};
};

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

			queryClient.setQueriesData<InfiniteData<PostListPage>>(
				{ queryKey: postListQueryKeys.root },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							posts: page.posts.map((post) =>
								unbookmarkedPostIds.includes(post.id)
									? {
											...post,
											isBookmarkedByAuthenticatedUser: false,
										}
									: post,
							),
						})),
					},
			);
			queryClient.setQueriesData<{ post: Post }>(
				{
					queryKey: postDetailsQueryKeys.root,
					predicate: ({ queryKey }) => queryKey.length === 2,
				},
				(data) =>
					data && unbookmarkedPostIds.includes(data.post.id)
						? {
								...data,
								post: {
									...data.post,
									isBookmarkedByAuthenticatedUser: false,
								},
							}
						: data,
			);

			queryClient.setQueryData<InfiniteData<PostListPage>>(
				postListQueryKeys.bookmarks({}),
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							posts: page.posts.filter(
								(post) => !unbookmarkedPostIds.includes(post.id),
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
