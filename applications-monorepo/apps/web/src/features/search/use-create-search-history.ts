import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { searchQueryKeys } from "./search.query-keys.ts";
import type { SearchHistoryItem } from "./search.types.ts";
import type { SearchHistoryResponse } from "./use-search-history.ts";

type CreateSearchHistoryInput =
	| { text: string; searchedUserId?: never }
	| { text?: never; searchedUserId: string };

const useCreateSearchHistory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateSearchHistoryInput) =>
			httpClient
				.post("user/create-search-history", { json: input })
				.json<SearchHistoryItem>(),
		onSuccess: (historyItem) => {
			queryClient.setQueriesData<InfiniteData<SearchHistoryResponse>>(
				{ queryKey: searchQueryKeys.historyRoot },
				(data) => {
					if (!data?.pages.length) return data;

					const pages = data.pages.map((page) => ({
						...page,
						history: page.history.filter((item) =>
							historyItem.searchedUserId
								? item.searchedUserId !== historyItem.searchedUserId
								: item.text?.toLocaleLowerCase() !==
									historyItem.text?.toLocaleLowerCase(),
						),
					}));
					const firstPage = pages[0];
					if (!firstPage) return data;
					pages[0] = {
						...firstPage,
						history: [historyItem, ...firstPage.history],
					};

					return { ...data, pages };
				},
			);
		},
	});
};

export { useCreateSearchHistory };
