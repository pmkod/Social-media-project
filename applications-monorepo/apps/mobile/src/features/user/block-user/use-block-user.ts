import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { Post } from "@/features/post/common/post";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys";
import type { User } from "@/features/user/common/user";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys";

type UserBlockState = Pick<
	User,
	| "id"
	| "followersCount"
	| "followingCount"
	| "isFollowedByAuthenticatedUser"
	| "isBlockedByAuthenticatedUser"
	| "hasBlockedAuthenticatedInUser"
>;

type BlockUserResponse = {
	message: string;
	blockedUser: UserBlockState;
};

export const useBlockUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) =>
			httpClient.post(`user/block-user/${userId}`).json<BlockUserResponse>(),
		onSuccess: ({ blockedUser }, userId) => {
			queryClient.setQueriesData<{ user: User }>(
				{ queryKey: userDetailsQueryKeys.root },
				(queryData) =>
					queryData?.user.id === userId
						? {
								...queryData,
								user: {
									...queryData.user,
									...blockedUser,
									isBlockedByAuthenticatedUser: true,
									isFollowedByAuthenticatedUser: false,
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
							users: page.users.map((user) =>
								user.id === userId
									? {
											...user,
											...blockedUser,
											isBlockedByAuthenticatedUser: true,
											isFollowedByAuthenticatedUser: false,
										}
									: user,
							),
						})),
					};
				},
			);

			queryClient.setQueriesData<InfiniteData<{ posts: Post[] }>>(
				{ queryKey: postListQueryKeys.root, exact: false },
				(data) => {
					if (!data) return data;
					return {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							posts: page.posts.filter((post) => post.author.id !== userId),
						})),
					};
				},
			);
		},
	});
};
