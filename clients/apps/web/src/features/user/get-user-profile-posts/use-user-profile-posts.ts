import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";

type ProfilePostListType = "posts" | "likes";

type ProfilePostsCursor = {
	id: string;
	createdAt: string;
};

type ProfilePostsResponse = {
	posts: Post[];
	pagination: {
		nextCursor: ProfilePostsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const useUserProfilePosts = (userId: string, type: ProfilePostListType) =>
	useInfiniteQuery({
		queryKey:
			type === "posts"
				? postListQueryKeys.userPosts(userId)
				: postListQueryKeys.userLikes(userId),
		queryFn: async ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "10" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			const path =
				type === "posts"
					? `posts/users/${userId}`
					: `posts/users/${userId}/likes`;
			return httpClient
				.get(path, { searchParams })
				.json<ProfilePostsResponse>();
		},
		initialPageParam: null as ProfilePostsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(userId),
	});

export { useUserProfilePosts };
export type { ProfilePostListType };
