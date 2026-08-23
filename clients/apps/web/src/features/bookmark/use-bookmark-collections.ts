import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys.ts";
import type { BookmarkCollection } from "./common/bookmark-collection.ts";

type BookmarkCollectionsCursor = { id: string; createdAt: string };
type BookmarkCollectionsResponse = {
	bookmarksCollections: BookmarkCollection[];
	pagination: {
		nextCursor: BookmarkCollectionsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const useBookmarkCollections = () =>
	useInfiniteQuery({
		queryKey: bookmarkCollectionsQueryKeys.mine(),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "10" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get("collections", { searchParams })
				.json<BookmarkCollectionsResponse>();
		},
		initialPageParam: null as BookmarkCollectionsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
	});

export { useBookmarkCollections };
