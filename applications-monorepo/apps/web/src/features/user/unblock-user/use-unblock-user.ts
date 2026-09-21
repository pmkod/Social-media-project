import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";

type UnblockUserResponse = {
	message: string;
};

const useUnblockUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) =>
			httpClient.delete(`user/unblock-user/${userId}`).json<UnblockUserResponse>(),
		onSuccess: (_, userId) => {
			queryClient.setQueriesData<{ user: User }>(
				{ queryKey: userDetailsQueryKeys.root },
				(queryData) =>
					queryData?.user.id === userId
						? {
								...queryData,
								user: {
									...queryData.user,
									isBlockedByAuthenticatedUser: false,
								},
							}
						: queryData,
			);

			queryClient.setQueriesData<InfiniteData<{ users: User[] }>>(
				{ queryKey: userListQueryKeys.root },
				(data) => {
					if (!data) return data;

					return {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							users: page.users.map((user) =>
								user.id === userId
									? { ...user, isBlockedByAuthenticatedUser: false }
									: user,
							),
						})),
					};
				},
			);
		},
	});
};

export { useUnblockUser };
