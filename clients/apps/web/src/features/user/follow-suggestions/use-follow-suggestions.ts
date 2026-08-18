import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { getAccessToken } from "@/core/utils/token.utils.ts";
import { followSuggestionsQueryKey } from "./follow-suggestions.query-key.ts";

type FollowSuggestion = {
	id: string;
	username: string;
	name: string;
	handle: string;
	fullName: string | null;
	displayName: string | null;
	avatarUrl: string | null;
	bio?: string | null;
	followersCount?: number;
	followingCount?: number;
	postCount?: number;
	isFollowedByAuthenticatedUser?: boolean;
};

type FollowSuggestionsResponse = {
	suggestions: FollowSuggestion[];
};

const useFollowSuggestions = (limit = 10) => {
	const query = useQuery({
		queryKey: [...followSuggestionsQueryKey, limit],
		queryFn: async () => {
			const accessToken = getAccessToken();
			if (!accessToken) {
				return { suggestions: [] };
			}
			return httpClient
				.get(`users/me/follow-suggestions?limit=${limit}`)
				.json<FollowSuggestionsResponse>();
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
	});

	return {
		...query,
		suggestions: query.data?.suggestions ?? [],
	};
};

export { useFollowSuggestions };
export type { FollowSuggestion };
