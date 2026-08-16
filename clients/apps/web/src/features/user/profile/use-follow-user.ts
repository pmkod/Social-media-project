import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import type { User } from "../common/user.ts";
import { authenticatedUserQueryKey } from "../get-authenticated-user/authenticated-user.query-key.ts";
import { userProfileQueryKeys } from "./user-profile.query-keys.ts";

type FollowResponse = {
	success: boolean;
	isFollowedByAuthenticatedUser: boolean;
	followersCount: number;
};

const useFollowUser = (username: string) => {
	const queryClient = useQueryClient();
	const queryKey = userProfileQueryKeys.byUsername(username);

	return useMutation({
		mutationFn: (userId: string) =>
			httpClient.post(`users/${userId}/followers`).json<FollowResponse>(),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey });
			const previousUser = queryClient.getQueryData<User>(queryKey);
			queryClient.setQueryData<User>(queryKey, (user) =>
				user
					? {
							...user,
							isFollowedByAuthenticatedUser: true,
							followersCount: (user.followersCount ?? 0) + 1,
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
							isFollowedByAuthenticatedUser: true,
							followersCount: response.followersCount,
						}
					: user,
			);
			queryClient.invalidateQueries({ queryKey: authenticatedUserQueryKey });
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.feedFollowing(),
			});
		},
	});
};

export { useFollowUser };
