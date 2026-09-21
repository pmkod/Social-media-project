import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { Post } from "../common/post";
import { postListQueryKeys } from "../common/post-list.query-keys";

type UserLikesCursor = {
	id: string;
	createdAt: string;
};

type UserLikesResponse = {
	posts: Post[];
	pagination: {
		nextCursor: UserLikesCursor | null;
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
				.get(`content/get-user-liked-posts/${userId}`, { searchParams })
				.json<UserLikesResponse>();
		},
		initialPageParam: null as UserLikesCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(userId),
	});

export { useUserLikedPosts };
