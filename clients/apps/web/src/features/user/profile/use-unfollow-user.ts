import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import type { User } from "../common/user.ts";
import { authenticatedUserQueryKey } from "../get-authenticated-user/authenticated-user.query-key.ts";
import { userConnectionsQueryKeys } from "./user-connections.query-keys.ts";
import { userProfileQueryKeys } from "./user-profile.query-keys.ts";

type UnfollowResponse = {
	success: boolean;
	isFollowedByAuthenticatedUser: boolean;
	followersCount: number;
};

const useUnfollowUser = (username: string) => {
	const queryClient = useQueryClient();
	const queryKey = userProfileQueryKeys.byUsername(username);

	return useMutation({
		mutationFn: (userId: string) =>
			httpClient.delete(`users/${userId}/followers`).json<UnfollowResponse>(),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey });
			const previousUser = queryClient.getQueryData<User>(queryKey);
			queryClient.setQueryData<User>(queryKey, (user) =>
				user
					? {
							...user,
							isFollowedByAuthenticatedUser: false,
							followersCount: Math.max(0, (user.followersCount ?? 0) - 1),
						}
					: user,
			);
			return { previousUser };
		},
		onError: (_error, _userId, context) => {
			queryClient.setQueryData(queryKey, context?.previousUser);
		},
		onSuccess: (response) => {
			queryClient.setQueryData<User>(queryKey, (user) =>
				user
					? {
							...user,
							isFollowedByAuthenticatedUser: false,
							followersCount: response.followersCount,
						}
					: user,
			);
			queryClient.invalidateQueries({ queryKey: authenticatedUserQueryKey });
			queryClient.invalidateQueries({
				queryKey: userConnectionsQueryKeys.root,
			});
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.feedFollowing(),
			});
		},
	});
};

export { useUnfollowUser };
