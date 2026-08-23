import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { postDetailsQueryKey } from "@/features/post/post-detail/post-detail.query-key.ts";
import type { BookmarkCollection } from "./common/bookmark-collection.ts";
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys.ts";

type RemoveBookmarkResponse = {
	success: boolean;
	post: Pick<Post, "id"> & {
		isBookmarkedByAuthenticatedUser: boolean;
	};
};

type RemoveBookmarkInput = {
	postId: string;
	bookmarkCollectionId: string;
};

const useRemoveBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, bookmarkCollectionId }: RemoveBookmarkInput) =>
			httpClient
				.delete(`posts/${postId}/bookmarks`, {
					searchParams: { bookmarkCollectionId },
				})
				.json<RemoveBookmarkResponse>(),
		onSuccess: (data, { postId, bookmarkCollectionId }) => {
			toast.success("Post removed from collection");
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
		},
		onError: () => {
			toast.error("Unable to remove post from collection");
		},
	});
};

export { useRemoveBookmark };
