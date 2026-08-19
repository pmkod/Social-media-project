import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "../common/user.ts";
import { userListQueryKeys } from "../common/user-list.query-keys.ts";

type FollowSuggestion = User & {
	isFollowedByAuthenticatedUser: boolean;
};

type FollowSuggestionsResponse = {
	users: FollowSuggestion[];
};

const useFollowSuggestions = () => {
	const limit = 7;
	return useQuery({
		queryKey: userListQueryKeys.followSuggestions({ limit }),
		queryFn: async () => {
			return httpClient
				.get(`users/me/follow-suggestions?limit=${limit}`)
				.json<FollowSuggestionsResponse>();
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
	});
};

export { useFollowSuggestions };
