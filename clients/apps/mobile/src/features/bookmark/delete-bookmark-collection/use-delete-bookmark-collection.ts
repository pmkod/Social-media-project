import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { BookmarkCollectionsResponse } from "../common/bookmark-collection";
import { bookmarkCollectionsQueryKeys } from "../common/bookmark-collections.query-keys";

const useDeleteBookmarkCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (collectionId: string) =>
			httpClient
				.delete(`collections/${collectionId}`)
				.json<{ message: string; unbookmarkedPostIds: string[] }>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
		},
	});
};

export { useDeleteBookmarkCollection };
