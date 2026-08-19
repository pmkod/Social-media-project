import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";

type ListFollowersCursor = { id: string; createdAt: string };
type ListFollowersResponse = {
	users: User[];
	pagination: {
		nextCursor: ListFollowersCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const useListFollowers = (userId: string) =>
	useInfiniteQuery({
		queryKey: userListQueryKeys.followers(userId),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "20" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get(`users/${userId}/followers`, { searchParams })
				.json<ListFollowersResponse>();
		},
		initialPageParam: null as ListFollowersCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(userId),
	});

export { useListFollowers };
