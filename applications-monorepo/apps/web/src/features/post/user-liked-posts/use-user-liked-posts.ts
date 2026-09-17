import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";

type UserLikedPostsCursor = {
	id: string;
	createdAt: string;
};

type UserLikedPostsResponse = {
	posts: Post[];
	pagination: {
		nextCursor: UserLikedPostsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

type UseUserLikedPostsParams = {
	userId: string;
};

const useUserLikedPosts = ({ userId }: UseUserLikedPostsParams) =>
	useInfiniteQuery({
		queryKey: postListQueryKeys.userLikes(userId),
		queryFn: async ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "10" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get(`posts/users/${userId}/likes`, { searchParams })
				.json<UserLikedPostsResponse>();
		},
		initialPageParam: null as UserLikedPostsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(userId),
	});

export { useUserLikedPosts };
