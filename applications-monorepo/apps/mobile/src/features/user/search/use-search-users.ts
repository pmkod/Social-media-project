import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { User } from "../common/user";
import { userListQueryKeys } from "../common/user-list.query-keys";

type SearchUsersCursor = {
	id: string;
	createdAt: string;
};

type SearchUsersResponse = {
	users: User[];
	pagination: {
		nextCursor: SearchUsersCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

type UseSearchUsersParams = {
	query: string;
	limit?: number;
	enabled?: boolean;
};

export const useSearchUsers = ({
	query,
	limit = 10,
	enabled = true,
}: UseSearchUsersParams) => {
	const normalizedQuery = query.trim();

	return useInfiniteQuery({
		queryKey: userListQueryKeys.search({
			query: normalizedQuery.toLowerCase(),
			limit,
		}),
		enabled: enabled && normalizedQuery.length > 0,
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({
				q: normalizedQuery,
				limit: String(limit),
			});
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}

			return httpClient
				.get("user/search-users", { searchParams })
				.json<SearchUsersResponse>();
		},
		initialPageParam: null as SearchUsersCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		staleTime: 1000 * 30,
	});
};
