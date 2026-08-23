import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type {
	BookmarkCollectionsCursor,
	BookmarkCollectionsResponse,
} from "./common/bookmark-collection.ts";
import { bookmarkCollectionsQueryKeys } from "./common/bookmark-collections.query-keys.ts";

type UseBookmarkCollectionsParams = {
	limit?: number;
	q?: string;
};

const useBookmarkCollections = ({
	limit = 10,
	q = "",
}: UseBookmarkCollectionsParams = {}) => {
	const normalizedQuery = q.trim();

	return useInfiniteQuery({
		queryKey: bookmarkCollectionsQueryKeys.mine({
			limit,
			q: normalizedQuery,
		}),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: String(limit) });
			if (normalizedQuery) searchParams.set("q", normalizedQuery);
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
};

export { useBookmarkCollections };
