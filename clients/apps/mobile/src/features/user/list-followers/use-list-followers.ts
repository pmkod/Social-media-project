import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { User } from "../common/user";
import { userListQueryKeys } from "../common/user-list.query-keys";

type ListFollowersCursor = { id: string; createdAt: string };
type ListFollowersResponse = {
	users: User[];
	pagination: {
		nextCursor: ListFollowersCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

export const useListFollowers = ({ userId }: { userId: string }) =>
	useInfiniteQuery({
		queryKey: userListQueryKeys.followers(userId),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "16" });
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
