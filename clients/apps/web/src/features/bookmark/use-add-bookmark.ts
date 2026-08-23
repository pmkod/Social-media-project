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
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys.ts";

type AddBookmarkInput = {
	postId: string;
	collectionId?: string;
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
		mutationFn: ({ postId, collectionId }: AddBookmarkInput) =>
			httpClient
				.post(`posts/${postId}/bookmarks`, {
					json: collectionId ? { collectionId } : {},
				})
				.json<AddBookmarkResponse>(),
		onSuccess: (data, { postId, collectionId }) => {
			toast.success("Post added to bookmarks");
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
				queryKey: postListQueryKeys.bookmarks({}),
			});
			if (collectionId) {
				queryClient.invalidateQueries({
					queryKey: postListQueryKeys.bookmarks({
						bookmarkCollectionId: collectionId,
					}),
				});
				queryClient.invalidateQueries({
					queryKey: bookmarkCollectionsQueryKeys.root,
				});
			}
		},
		onError: () => {
			toast.error("Unable to add post to bookmarks");
		},
	});
};

export { useAddBookmark };
