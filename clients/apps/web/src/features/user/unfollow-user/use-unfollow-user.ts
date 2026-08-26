import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";

type UnfollowResponse = {
	unfollowedUser: Pick<
		User,
		"id" | "isFollowedByAuthenticatedUser" | "followersCount"
	>;
};

type UnfollowUserInput = {
	userId: string;
};

const useUnfollowUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId }: UnfollowUserInput) =>
			httpClient.delete(`users/${userId}/follow`).json<UnfollowResponse>(),
		onSuccess: ({ unfollowedUser }) => {
			queryClient.setQueriesData<{ user: User }>(
				{ queryKey: userDetailsQueryKeys.root },
				(queryData) =>
					queryData !== undefined && queryData.user.id === unfollowedUser.id
						? {
								...queryData,
								user: {
									...queryData.user,
									isFollowedByAuthenticatedUser:
										unfollowedUser.isFollowedByAuthenticatedUser,
									followersCount: unfollowedUser.followersCount,
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
								cachedUser.id === unfollowedUser.id
									? {
											...cachedUser,
											isFollowedByAuthenticatedUser:
												unfollowedUser.isFollowedByAuthenticatedUser,
											followersCount: unfollowedUser.followersCount,
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

export { useUnfollowUser };
