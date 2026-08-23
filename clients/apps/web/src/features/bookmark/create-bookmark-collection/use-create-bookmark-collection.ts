import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { bookmarkCollectionsQueryKeys } from "../common/bookmark-collections.query-keys.ts";
import type { BookmarkCollection } from "../common/bookmark-collection.ts";

type CreateCollectionInput = {
	name: string;
	description?: string;
};

const useCreateBookmarkCollection = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateCollectionInput) =>
			httpClient
				.post("collections", { json: input })
				.json<BookmarkCollection>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
		},
	});
};

export { useCreateBookmarkCollection };
