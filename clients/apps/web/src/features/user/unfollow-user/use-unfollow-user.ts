import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";
import { userDetailsQueryKeys } from "@/features/user/user-profile/user-details-query-keys.ts";

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
			queryClient.setQueriesData<User>(
				{ queryKey: userDetailsQueryKeys.root },
				(cachedUser) =>
					cachedUser?.id === unfollowedUser.id
						? {
								...cachedUser,
								isFollowedByAuthenticatedUser:
									unfollowedUser.isFollowedByAuthenticatedUser,
								followersCount: unfollowedUser.followersCount,
							}
						: cachedUser,
			);

			queryClient.setQueriesData<{ users: User[] }>(
				{ queryKey: userListQueryKeys.root },
				(data) =>
					data
						? {
								...data,
								users: data.users.map((cachedUser) =>
									cachedUser.id === unfollowedUser.id
										? {
												...cachedUser,
												isFollowedByAuthenticatedUser:
													unfollowedUser.isFollowedByAuthenticatedUser,
												followersCount: unfollowedUser.followersCount,
											}
										: cachedUser,
								),
							}
						: data,
			);
		},
	});
};

export { useUnfollowUser };
