import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { BookmarkCollection } from "../common/bookmark-collection.ts";
import type { BookmarkCollectionModalFormValues } from "../common/bookmark-collection-modal-form.tsx";
import { bookmarkCollectionsQueryKeys } from "../common/bookmark-collections.query-keys.ts";

type EditBookmarkCollectionInput = BookmarkCollectionModalFormValues & {
	collectionId: string;
};

const useEditBookmarkCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ collectionId, ...input }: EditBookmarkCollectionInput) =>
			httpClient
				.put(`collections/${collectionId}`, { json: input })
				.json<BookmarkCollection>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
		},
	});
};

export { useEditBookmarkCollection };
export type { EditBookmarkCollectionInput };
