import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";

type FollowResponse = {
	message: string;
	followedUser: Pick<
		User,
		"id" | "isFollowedByAuthenticatedUser" | "followersCount"
	>;
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

export { useFollowUser };
