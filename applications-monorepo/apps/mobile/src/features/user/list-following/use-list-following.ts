import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { User } from "../common/user";
import { userListQueryKeys } from "../common/user-list.query-keys";

type ListFollowingCursor = { id: string; createdAt: string };
type ListFollowingResponse = {
	users: User[];
	pagination: {
		nextCursor: ListFollowingCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

export const useListFollowing = ({ userId }: { userId: string }) =>
	useInfiniteQuery({
		queryKey: userListQueryKeys.following(userId),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "16" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get(`user/get-user-following/${userId}`, { searchParams })
				.json<ListFollowingResponse>();
		},
		initialPageParam: null as ListFollowingCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(userId),
	});
