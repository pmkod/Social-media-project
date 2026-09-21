import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { User } from "../common/user";
import { userDetailsQueryKeys } from "../common/user-details-query-keys";
import { userListQueryKeys } from "../common/user-list.query-keys";

type FollowResponse = {
	message: string;
	followedUser: Pick<
		User,
		"id" | "isFollowedByAuthenticatedUser" | "followersCount"
	>;
};

export const useFollowUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId }: { userId: string }) =>
			httpClient.post(`user/follow-user/${userId}`).json<FollowResponse>(),
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
									followersCount: followedUser.followersCount,
								},
							}
						: queryData,
			);

			queryClient.setQueriesData<InfiniteData<{ users: User[] }>>(
				{ queryKey: userListQueryKeys.root, exact: false },
				(data) => {
					if (!data) return data;
					return {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							users: page.users.map((cachedUser) =>
								cachedUser.id === followedUser.id
									? {
											...cachedUser,
											isFollowedByAuthenticatedUser:
												followedUser.isFollowedByAuthenticatedUser,
											followersCount: followedUser.followersCount,
										}
									: cachedUser,
							),
						})),
					};
				},
			);
		},
	});
};
