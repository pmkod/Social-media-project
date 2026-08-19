import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userConnectionsQueryKeys } from "./user-connections.query-keys.ts";

type UserConnectionType = "followers" | "following";
type UserConnectionsCursor = { id: string; createdAt: string };
type UserConnectionsResponse = {
	users: User[];
	pagination: {
		nextCursor: UserConnectionsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const useUserConnections = (userId: string, type: UserConnectionType) =>
	useInfiniteQuery({
		queryKey:
			type === "followers"
				? userConnectionsQueryKeys.followers(userId)
				: userConnectionsQueryKeys.following(userId),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "20" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get(`users/${userId}/${type}`, { searchParams })
				.json<UserConnectionsResponse>();
		},
		initialPageParam: null as UserConnectionsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(userId),
	});

export { useUserConnections };
export type { UserConnectionType };
