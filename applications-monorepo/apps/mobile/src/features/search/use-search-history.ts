import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { searchQueryKeys } from "./search.query-keys";
import type { SearchHistoryItem } from "./search.types";

type SearchHistoryCursor = {
	id: string;
	createdAt: string;
};

export type SearchHistoryResponse = {
	history: SearchHistoryItem[];
	pagination: {
		nextCursor: SearchHistoryCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

export const useSearchHistory = (limit = 20, enabled = true) =>
	useInfiniteQuery({
		queryKey: searchQueryKeys.history(limit),
		enabled,
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: String(limit) });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}

			return httpClient
				.get("search/history", { searchParams })
				.json<SearchHistoryResponse>();
		},
		initialPageParam: null as SearchHistoryCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
	});
