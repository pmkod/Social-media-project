import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";

type BlockedUsersCursor = { id: string; createdAt: string };
type BlockedUsersResponse = {
	users: User[];
	pagination: {
		nextCursor: BlockedUsersCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const useBlockedUsers = () =>
	useInfiniteQuery({
		queryKey: userListQueryKeys.blocked(),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "20" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get("users/me/blocked", { searchParams })
				.json<BlockedUsersResponse>();
		},
		initialPageParam: null as BlockedUsersCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
	});

export { useBlockedUsers };
