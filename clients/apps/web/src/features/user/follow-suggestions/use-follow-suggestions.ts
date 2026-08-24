import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "../common/user.ts";
import { userListQueryKeys } from "../common/user-list.query-keys.ts";

type FollowSuggestionsCursor = {
	id: string;
	createdAt: string;
	followersCount: number;
};

type FollowSuggestionsResponse = {
	users: User[];
	pagination: {
		nextCursor: FollowSuggestionsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const useFollowSuggestions = () => {
	const limit = 7;
	return useInfiniteQuery({
		queryKey: userListQueryKeys.followSuggestions({ limit }),
		queryFn: async ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: String(limit) });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
				searchParams.set(
					"cursorFollowersCount",
					String(pageParam.followersCount),
				);
			}

			return httpClient
				.get("users/me/follow-suggestions", { searchParams })
				.json<FollowSuggestionsResponse>();
		},
		initialPageParam: null as FollowSuggestionsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		staleTime: 1000 * 60 * 2, // 2 minutes
	});
};

export { useFollowSuggestions };
