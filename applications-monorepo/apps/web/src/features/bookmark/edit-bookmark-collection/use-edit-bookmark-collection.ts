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
import type { BookmarkCollectionModalFormValues } from "../common/bookmark-collection-modal.tsx";
import {
	type BookmarkCollectionsQueryParams,
	bookmarkCollectionsQueryKeys,
} from "../common/bookmark-collections.query-keys.ts";

type EditBookmarkCollectionInput = BookmarkCollectionModalFormValues & {
	collectionId: string;
};

const useEditBookmarkCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ collectionId, ...input }: EditBookmarkCollectionInput) =>
			httpClient
				.put(`collections/${collectionId}`, { json: input })
				.json<BookmarkCollectionResponse>(),
		onSuccess: ({ bookmarkCollection }) => {
			const collectionMatchesQuery = (queryKey: readonly unknown[]) => {
				const params = queryKey.at(-1) as
					| BookmarkCollectionsQueryParams
					| undefined;
				const query = params?.q.trim().toLocaleLowerCase() ?? "";
				return bookmarkCollection.name.toLocaleLowerCase().includes(query);
			};

			queryClient.setQueriesData<InfiniteData<BookmarkCollectionsResponse>>(
				{
					queryKey: bookmarkCollectionsQueryKeys.root,
					predicate: ({ queryKey }) => collectionMatchesQuery(queryKey),
				},
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							bookmarkCollections: page.bookmarkCollections.map((collection) =>
								collection.id === bookmarkCollection.id
									? { ...collection, ...bookmarkCollection }
									: collection,
							),
						})),
					},
			);

			queryClient.setQueriesData<InfiniteData<BookmarkCollectionsResponse>>(
				{
					queryKey: bookmarkCollectionsQueryKeys.root,
					predicate: ({ queryKey }) => !collectionMatchesQuery(queryKey),
				},
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							bookmarkCollections: page.bookmarkCollections.filter(
								(collection) => collection.id !== bookmarkCollection.id,
							),
						})),
					},
			);
		},
	});
};

export { useEditBookmarkCollection };
