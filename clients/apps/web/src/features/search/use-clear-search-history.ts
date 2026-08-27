import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { searchQueryKeys } from "./search.query-keys.ts";

const useClearSearchHistory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			httpClient.delete("search/history").json<{ success: boolean }>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: searchQueryKeys.historyRoot,
			});
		},
	});
};

export { useClearSearchHistory };
