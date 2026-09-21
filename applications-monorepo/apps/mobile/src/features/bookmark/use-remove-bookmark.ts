import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { Post } from "@/features/post/common/post";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys";
import { postDetailsQueryKeys } from "@/features/post/post-detail/post-detail.query-keys";
import type { BookmarkCollection } from "./common/bookmark-collection";
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys";

type RemoveBookmarkInput = {
	postId: string;
	bookmarkCollectionId?: string;
};

type RemoveBookmarkResponse = {
	message: string;
	post: Pick<Post, "id"> & {
		isBookmarkedByAuthenticatedUser: boolean;
	};
};

const useRemoveBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, bookmarkCollectionId }: RemoveBookmarkInput) =>
			httpClient
				.delete(`content/remove-bookmark/${postId}`, {
					searchParams: bookmarkCollectionId ? { bookmarkCollectionId } : undefined,
				})
				.json<RemoveBookmarkResponse>(),
		onSuccess: (data, { postId, bookmarkCollectionId }) => {
			const isBookmarked = data.post?.isBookmarkedByAuthenticatedUser ?? false;

			queryClient.setQueriesData<InfiniteData<{ posts: Post[] }>>(
				{ queryKey: postListQueryKeys.root, exact: false },
				(oldData) => {
					if (!oldData) return undefined;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							posts: page.posts.map((post) =>
								post.id === postId
									? { ...post, isBookmarkedByAuthenticatedUser: isBookmarked }
									: post,
							),
						})),
					};
				},
			);

			queryClient.setQueryData<{ post: Post }>(
				postDetailsQueryKeys.build(postId),
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

			if (bookmarkCollectionId) {
				queryClient.setQueriesData<
					InfiniteData<{ bookmarkCollections: BookmarkCollection[] }>
				>({ queryKey: bookmarkCollectionsQueryKeys.root }, (oldData) => {
					if (!oldData) return undefined;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							bookmarkCollections: page.bookmarkCollections.map(
								(bookmarkCollection) =>
									bookmarkCollection.id === bookmarkCollectionId
										? {
												...bookmarkCollection,
												isPostInCollection: false,
											}
										: bookmarkCollection,
							),
						})),
					};
				});
			}
		},
	});
};

export { useRemoveBookmark };
