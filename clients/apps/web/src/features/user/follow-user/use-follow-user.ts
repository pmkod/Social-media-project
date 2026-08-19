import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import type { User } from "@/features/user/common/user.ts";
import { authenticatedUserQueryKey } from "@/features/user/get-authenticated-user/authenticated-user.query-key.ts";
import { userConnectionsQueryKeys } from "@/features/user/get-user-connections/user-connections.query-keys.ts";
import { userDetailsQueryKeys } from "@/features/user/get-user-profile/user-details-query-keys.ts";

type FollowResponse = {
	success: boolean;
	isFollowedByAuthenticatedUser: boolean;
	followersCount: number;
};

type FollowUserInput = {
	userId: string;
};

const useFollowUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId }: FollowUserInput) =>
			httpClient.post(`users/${userId}/follow`).json<FollowResponse>(),
	});
};

export { useFollowUser };
