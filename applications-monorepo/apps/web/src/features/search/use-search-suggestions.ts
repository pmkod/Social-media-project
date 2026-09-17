import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { searchQueryKeys } from "./search.query-keys.ts";

type SearchSuggestionsResponse = {
	suggestions: string[];
};

const useSearchSuggestions = (query: string) => {
	const normalizedQuery = query.trim();

	return useQuery({
		queryKey: searchQueryKeys.suggestions(normalizedQuery),
		enabled: normalizedQuery.length > 0,
		queryFn: () =>
			httpClient
				.get("search/suggestions", {
					searchParams: { q: normalizedQuery },
				})
				.json<SearchSuggestionsResponse>(),
		staleTime: 1000 * 60,
	});
};

export { useSearchSuggestions };
