import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { searchQueryKeys } from "./search.query-keys";
import type { SearchHistoryResponse } from "./use-search-history";

export const useDeleteSearchHistoryItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (historyId: string) =>
			httpClient
				.delete(`search/history/${historyId}`)
				.json<{ message: string }>(),
		onSuccess: (_, historyId) => {
			queryClient.setQueriesData<InfiniteData<SearchHistoryResponse>>(
				{ queryKey: searchQueryKeys.historyRoot },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							history: page.history.filter((item) => item.id !== historyId),
						})),
					},
			);
		},
	});
};
