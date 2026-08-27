import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { searchQueryKeys } from "./search.query-keys.ts";
import type {
	CreateSearchHistoryInput,
	SearchHistoryItem,
} from "./search.types.ts";

const useCreateSearchHistory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateSearchHistoryInput) =>
			httpClient
				.post("search/history", { json: input })
				.json<SearchHistoryItem>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: searchQueryKeys.historyRoot,
			});
		},
	});
};

export { useCreateSearchHistory };
