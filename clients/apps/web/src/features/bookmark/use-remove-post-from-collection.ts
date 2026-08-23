import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys.ts";

type RemovePostFromCollectionInput = {
	collectionId: string;
	postId: string;
};

const useRemovePostFromCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ collectionId, postId }: RemovePostFromCollectionInput) =>
			httpClient
				.delete(`collections/${collectionId}/posts/${postId}`)
				.json<{ success: boolean }>(),
		onSuccess: (_response, { collectionId }) => {
			toast.success("Post removed from collection");
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.bookmarks({
					bookmarkCollectionId: collectionId,
				}),
			});
		},
		onError: () => {
			toast.error("Unable to remove post from collection");
		},
	});
};

export { useRemovePostFromCollection };
