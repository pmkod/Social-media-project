import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post, PostType } from "../common/post.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";

type UserPostsCursor = {
	id: string;
	createdAt: string;
};

type UserPostsResponse = {
	posts: Post[];
	pagination: {
		nextCursor: UserPostsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

type UseUserPostsParams = {
	userId: string;
	type?: PostType;
};

const useUserPosts = ({ userId, type = "POST" }: UseUserPostsParams) =>
	useInfiniteQuery({
		queryKey: postListQueryKeys.userPosts(userId, type),
		queryFn: async ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "10", type });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get(`posts/users/${userId}`, { searchParams })
				.json<UserPostsResponse>();
		},
		initialPageParam: null as UserPostsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(userId),
	});

export { useUserPosts };
