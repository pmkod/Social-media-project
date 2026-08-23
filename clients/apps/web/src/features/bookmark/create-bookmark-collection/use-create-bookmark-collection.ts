import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type {
	BookmarkCollectionResponse,
	BookmarkCollectionsResponse,
} from "../common/bookmark-collection.ts";
import {
	type BookmarkCollectionsQueryParams,
	bookmarkCollectionsQueryKeys,
} from "../common/bookmark-collections.query-keys.ts";

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
			queryClient.setQueriesData<InfiniteData<BookmarkCollectionsResponse>>(
				{
					queryKey: bookmarkCollectionsQueryKeys.root,
					predicate: ({ queryKey }) => {
						const params = queryKey.at(-1) as
							| BookmarkCollectionsQueryParams
							| undefined;
						const query = params?.q.toLocaleLowerCase();

						return (
							!query ||
							bookmarkCollection.name.toLocaleLowerCase().includes(query)
						);
					},
				},
				(data) => {
					if (!data?.pages.length) return data;

					return {
						...data,
						pages: data.pages.map((page, index) =>
							index === 0
								? {
										...page,
										bookmarkCollections: [
											bookmarkCollection,
											...page.bookmarkCollections,
										],
									}
								: page,
						),
					};
				},
			);
		},
	});
};

export { useCreateBookmarkCollection };
