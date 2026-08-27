import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { searchQueryKeys } from "./search.query-keys.ts";

const useDeleteSearchHistoryItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (historyId: string) =>
			httpClient
				.delete(`search/history/${historyId}`)
				.json<{ success: boolean }>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: searchQueryKeys.historyRoot,
			});
		},
	});
};

export { useDeleteSearchHistoryItem };
