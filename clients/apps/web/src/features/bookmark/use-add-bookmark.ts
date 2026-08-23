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

type AddBookmarkInput = {
	postId: string;
	bookmarkCollectionId: string;
};

type AddBookmarkResponse = {
	success: boolean;
	post: Pick<Post, "id"> & {
		isBookmarkedByAuthenticatedUser: boolean;
	};
};

const useAddBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, bookmarkCollectionId }: AddBookmarkInput) =>
			httpClient
				.post(`posts/${postId}/bookmarks`, {
					json: { bookmarkCollectionId },
				})
				.json<AddBookmarkResponse>(),
		onSuccess: (data, variables) => {
			toast.success("Post added to collection");
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
				postDetailsQueryKey.build(variables.postId),
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
			>(
				{
					queryKey: bookmarkCollectionsQueryKeys.root,
				},
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
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.bookmarks({
					bookmarkCollectionId: variables.bookmarkCollectionId,
				}),
			});
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.bookmarks({}),
			});
		},
		onError: () => {
			toast.error("Unable to add post to collection");
		},
	});
};

export { useAddBookmark };
