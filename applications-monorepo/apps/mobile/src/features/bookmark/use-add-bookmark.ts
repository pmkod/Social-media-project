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

type AddBookmarkInput = {
	postId: string;
	bookmarkCollectionId?: string;
};

type AddBookmarkResponse = {
	message: string;
	post: Pick<Post, "id"> & {
		isBookmarkedByAuthenticatedUser: boolean;
	};
};

const useAddBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, bookmarkCollectionId }: AddBookmarkInput) =>
			httpClient
				.post(`content/add-bookmark/${postId}`, {
					json: bookmarkCollectionId ? { bookmarkCollectionId } : {},
				})
				.json<AddBookmarkResponse>(),
		onSuccess: (data, variables) => {
			const isBookmarked = data.post?.isBookmarkedByAuthenticatedUser ?? true;

			queryClient.setQueriesData<InfiniteData<{ posts: Post[] }>>(
				{ queryKey: postListQueryKeys.root, exact: false },
				(oldData) => {
					if (!oldData) return undefined;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							posts: page.posts.map((post) =>
								post.id === variables.postId
									? { ...post, isBookmarkedByAuthenticatedUser: isBookmarked }
									: post,
							),
						})),
					};
				},
			);

			queryClient.setQueryData<{ post: Post }>(
				postDetailsQueryKeys.build(variables.postId),
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

			if (variables.bookmarkCollectionId) {
				queryClient.setQueriesData<
					InfiniteData<{ bookmarkCollections: BookmarkCollection[] }>
				>(
					{ queryKey: bookmarkCollectionsQueryKeys.root },
					(oldData) => {
						if (!oldData) return undefined;
						return {
							...oldData,
							pages: oldData.pages.map((page) => ({
								...page,
								bookmarkCollections: page.bookmarkCollections.map(
									(bookmarkCollection) =>
										bookmarkCollection.id === variables.bookmarkCollectionId
											? {
													...bookmarkCollection,
													isPostInCollection: true,
												}
											: bookmarkCollection,
								),
							})),
						};
					},
				);
			}
		},
	});
};

export { useAddBookmark };
