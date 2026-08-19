import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";

type ListFollowingCursor = { id: string; createdAt: string };
type ListFollowingResponse = {
	users: User[];
	pagination: {
		nextCursor: ListFollowingCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const useListFollowing = (userId: string) =>
	useInfiniteQuery({
		queryKey: userListQueryKeys.following(userId),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "20" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get(`users/${userId}/following`, { searchParams })
				.json<ListFollowingResponse>();
		},
		initialPageParam: null as ListFollowingCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(userId),
	});

export { useListFollowing };
