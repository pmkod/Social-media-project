import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { User } from "../common/user";
import { userListQueryKeys } from "../common/user-list.query-keys";

type FollowSuggestionsCursor = {
	id: string;
	createdAt: string;
};

type FollowSuggestionsResponse = {
	users: User[];
	pagination: {
		nextCursor: FollowSuggestionsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

export const useFollowSuggestions = ({
	enabled = true,
}: {
	enabled?: boolean;
} = {}) => {
	const limit = 7;
	return useInfiniteQuery({
		enabled,
		queryKey: userListQueryKeys.followSuggestions({ limit }),
		queryFn: async ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: String(limit) });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}

			return httpClient
				.get("user/get-follow-suggestions", { searchParams })
				.json<FollowSuggestionsResponse>();
		},
		initialPageParam: null as FollowSuggestionsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		staleTime: 1000 * 60 * 2,
	});
};
