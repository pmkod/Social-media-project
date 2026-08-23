import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { BookmarkCollection } from "./common/bookmark-collection.ts";
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys.ts";

type BookmarkCollectionsCursor = { id: string; createdAt: string };
type BookmarkCollectionsResponse = {
	bookmarksCollections: BookmarkCollection[];
	pagination: {
		nextCursor: BookmarkCollectionsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

type UseBookmarkCollectionsParams = {
	limit?: number;
};

const useBookmarkCollections = ({
	limit = 10,
}: UseBookmarkCollectionsParams = {}) =>
	useInfiniteQuery({
		queryKey: bookmarkCollectionsQueryKeys.mine(limit),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: String(limit) });
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
