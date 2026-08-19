import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { userListQueryKeys } from "../common/user-list.query-keys.ts";
import type { User } from "../common/user.ts";

type FollowSuggestionsResponse = {
	users: User[];
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
