import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";
import {
	removeAuthorPostsFromCache,
	type UserBlockState,
	updateAuthenticatedUserCounts,
	updateUserBlockState,
} from "./user-block.cache-utils.ts";

type BlockUserResponse = {
	message: string;
	blockedUser: UserBlockState;
	authenticatedUser: {
		id: string;
		followersCount: number;
		followingCount: number;
	};
};

const useBlockUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) =>
			httpClient.post(`users/${userId}/block`).json<BlockUserResponse>(),
		onSuccess: ({ blockedUser, authenticatedUser }) => {
			updateUserBlockState(queryClient, blockedUser);
			updateAuthenticatedUserCounts(queryClient, authenticatedUser);
			removeAuthorPostsFromCache(queryClient, blockedUser.id);
			void queryClient.invalidateQueries({ queryKey: userListQueryKeys.root });
		},
	});
};

export { useBlockUser };
