import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import type { User } from "@/features/user/common/user.ts";
import { authenticatedUserQueryKey } from "@/features/user/get-authenticated-user/authenticated-user.query-key.ts";
import { userConnectionsQueryKeys } from "@/features/user/get-user-connections/user-connections.query-keys.ts";
import { userDetailsQueryKeys } from "@/features/user/get-user-profile/user-details-query-keys.ts";

type UnfollowResponse = {
	message: string;
};

type UnfollowUserInput = {
	userId: string;
};

const useUnfollowUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId }: UnfollowUserInput) =>
			httpClient.delete(`users/${userId}/follow`).json<UnfollowResponse>(),
	});
};

export { useUnfollowUser };
