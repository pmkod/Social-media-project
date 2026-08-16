import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { bookmarkCollectionQueryKeys } from "./common/bookmark-collection.query-keys.ts";
import type { BookmarkCollection } from "./common/bookmark-collection.ts";

type CollectionsResponse = { collections: BookmarkCollection[] };

const useBookmarkCollections = (userId?: string) =>
	useQuery({
		queryKey: userId
			? bookmarkCollectionQueryKeys.user(userId)
			: bookmarkCollectionQueryKeys.mine(),
		queryFn: () =>
			httpClient
				.get(userId ? `collections/users/${userId}` : "collections")
				.json<CollectionsResponse>(),
	});

export { useBookmarkCollections };
