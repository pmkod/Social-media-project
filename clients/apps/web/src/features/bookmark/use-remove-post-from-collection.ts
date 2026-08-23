import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys.ts";

type CollectionPostInput = { collectionId: string; postId: string };

const useRemovePostFromCollection = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ collectionId, postId }: CollectionPostInput) =>
			httpClient
				.delete(`collections/${collectionId}/posts/${postId}`)
				.json<{ success: boolean }>(),
		onSuccess: (_response, input) => {
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.collectionPosts(input.collectionId),
			});
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
		},
	});
};

export { useRemovePostFromCollection };
