import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { bookmarkCollectionQueryKeys } from "./common/bookmark-collection.query-keys.ts";
import type { BookmarkCollection } from "./common/bookmark-collection.ts";

type CreateCollectionInput = {
	name: string;
	description?: string;
	isPublic: boolean;
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
				queryKey: bookmarkCollectionQueryKeys.root,
			});
		},
	});
};

export { useCreateBookmarkCollection };
