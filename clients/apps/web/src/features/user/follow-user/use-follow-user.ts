import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";
import {
	type UserListCache,
	updateUserListCache,
} from "@/features/user/common/user-list-cache.ts";

type FollowResponse = {
	message: string;
	followedUser: Pick<User, "id" | "isFollowedByAuthenticatedUser">;
};

type FollowUserInput = {
	userId: string;
};

const useFollowUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId }: FollowUserInput) =>
			httpClient.post(`users/${userId}/follow`).json<FollowResponse>(),
		onSuccess: ({ followedUser }) => {
			queryClient.setQueriesData<{ user: User }>(
				{ queryKey: userDetailsQueryKeys.root },
				(queryData) =>
					queryData !== undefined && queryData?.user.id === followedUser.id
						? {
								...queryData,
								user: {
									...queryData.user,
									isFollowedByAuthenticatedUser:
										followedUser.isFollowedByAuthenticatedUser,
									followersCount: queryData.user.followersCount
										? queryData.user.followersCount + 1
										: 0,
								},
							}
						: queryData,
			);

			queryClient.setQueriesData<UserListCache>(
				{ queryKey: userListQueryKeys.root },
				(data) =>
					updateUserListCache(data, (cachedUser) =>
						cachedUser.id === followedUser.id
							? {
									...cachedUser,
									isFollowedByAuthenticatedUser:
										followedUser.isFollowedByAuthenticatedUser,
									followersCount: cachedUser.followersCount
										? cachedUser.followersCount + 1
										: 0,
								}
							: cachedUser,
					),
			);
		},
	});
};

export { useFollowUser };
