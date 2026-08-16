import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { bookmarkCollectionQueryKeys } from "./common/bookmark-collection.query-keys.ts";

const useDeleteBookmarkCollection = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (collectionId: string) =>
			httpClient
				.delete(`collections/${collectionId}`)
				.json<{ success: boolean }>(),
		onSuccess: (_response, collectionId) => {
			queryClient.removeQueries({
				queryKey: postListQueryKeys.collectionPosts(collectionId),
			});
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionQueryKeys.root,
			});
		},
	});
};

export { useDeleteBookmarkCollection };
