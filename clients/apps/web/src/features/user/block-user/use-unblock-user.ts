import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";
import {
	type UserBlockState,
	updateUserBlockState,
} from "./user-block.cache-utils.ts";

type UnblockUserResponse = {
	message: string;
	unblockedUser: UserBlockState;
};

const useUnblockUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) =>
			httpClient.delete(`users/${userId}/block`).json<UnblockUserResponse>(),
		onSuccess: ({ unblockedUser }) => {
			updateUserBlockState(queryClient, unblockedUser);
			void queryClient.invalidateQueries({ queryKey: userListQueryKeys.root });
		},
	});
};

export { useUnblockUser };
