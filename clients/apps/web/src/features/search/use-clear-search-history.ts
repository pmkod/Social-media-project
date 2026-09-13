import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { searchQueryKeys } from "./search.query-keys.ts";
import type { SearchHistoryResponse } from "./search.types.ts";

const useClearSearchHistory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			httpClient.delete("search/history").json<{ message: string }>(),
		onSuccess: () => {
			queryClient.setQueriesData<InfiniteData<SearchHistoryResponse>>(
				{ queryKey: searchQueryKeys.historyRoot },
				(oldData) =>
					oldData && {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							history: [],
							pagination: {
								...page.pagination,
								nextCursor: null,
								hasNextPage: false,
							},
						})),
					},
			);
		},
	});
};

export { useClearSearchHistory };
