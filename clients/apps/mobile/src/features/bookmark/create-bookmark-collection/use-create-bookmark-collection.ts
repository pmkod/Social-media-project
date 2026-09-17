import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type {
	BookmarkCollectionResponse,
	BookmarkCollectionsResponse,
} from "../common/bookmark-collection";
import {
	type BookmarkCollectionsQueryParams,
	bookmarkCollectionsQueryKeys,
} from "../common/bookmark-collections.query-keys";

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
				.json<BookmarkCollectionResponse>(),
		onSuccess: ({ bookmarkCollection }) => {
			queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
		},
	});
};

export { useCreateBookmarkCollection };
