import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { bookmarkCollectionsQueryKeys } from "../common/bookmark-collections.query-keys.ts";

const useDeleteBookmarkCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (collectionId: string) =>
			httpClient
				.delete(`collections/${collectionId}`)
				.json<{ success: boolean }>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
		},
	});
};

export { useDeleteBookmarkCollection };
