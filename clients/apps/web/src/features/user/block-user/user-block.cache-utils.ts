import type { QueryClient } from "@tanstack/react-query";
import { bookmarkCollectionQueryKeys } from "@/features/bookmark/common/bookmark-collection.query-keys.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key.ts";
import type { User } from "@/features/user/common/user.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import { userListQueryKeys } from "@/features/user/common/user-list.query-keys.ts";
import {
	type UserListCache,
	updateUserListCache,
} from "@/features/user/common/user-list-cache.ts";

type UserBlockState = Pick<
	User,
	| "id"
	| "followersCount"
	| "followingCount"
	| "isFollowedByAuthenticatedUser"
	| "isBlockedByAuthenticatedUser"
	| "hasBlockedAuthenticatedInUser"
>;

const updateUserBlockState = (
	queryClient: QueryClient,
	updatedUser: UserBlockState,
) => {
	queryClient.setQueriesData<{ user: User }>(
		{ queryKey: userDetailsQueryKeys.root },
		(queryData) =>
			queryData?.user.id === updatedUser.id
				? { ...queryData, user: { ...queryData.user, ...updatedUser } }
				: queryData,
	);
	queryClient.setQueriesData<UserListCache>(
		{ queryKey: userListQueryKeys.root },
		(data) =>
			updateUserListCache(data, (user) =>
				user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
			),
	);
};

type PostListCache =
	| { posts?: Post[] }
	| { pages: Array<{ posts?: Post[] }>; pageParams: unknown[] };

const removeAuthorPostsFromCache = (
	queryClient: QueryClient,
	authorId: string,
) => {
	const filterPosts = (posts: Post[] | undefined) =>
		posts?.filter(
			(post) => post.authorId !== authorId && post.author?.id !== authorId,
		);

	queryClient.setQueriesData<PostListCache>(
		{ queryKey: postListQueryKeys.root },
		(data) => {
			if (!data) return data;
			if ("pages" in data) {
				return {
					...data,
					pages: data.pages.map((page) => ({
						...page,
						posts: filterPosts(page.posts),
					})),
				};
			}
			return { ...data, posts: filterPosts(data.posts) };
		},
	);
	queryClient.removeQueries({
		queryKey: postListQueryKeys.userPosts(authorId),
	});
	queryClient.removeQueries({
		queryKey: postListQueryKeys.userLikes(authorId),
	});
	queryClient.removeQueries({
		queryKey: bookmarkCollectionQueryKeys.user(authorId),
	});
};

const updateAuthenticatedUserCounts = (
	queryClient: QueryClient,
	user: { id: string; followersCount: number; followingCount: number },
) => {
	queryClient.setQueryData<Record<string, unknown>>(
		authenticatedUserQueryKey,
		(data) => (data ? { ...data, ...user } : data),
	);
	queryClient.setQueriesData<{ user: User }>(
		{ queryKey: userDetailsQueryKeys.root },
		(queryData) =>
			queryData?.user.id === user.id
				? { ...queryData, user: { ...queryData.user, ...user } }
				: queryData,
	);
};

export {
	removeAuthorPostsFromCache,
	updateAuthenticatedUserCounts,
	updateUserBlockState,
};
export type { UserBlockState };
