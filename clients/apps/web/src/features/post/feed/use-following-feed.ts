import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post, PostType } from "../common/post.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";

export type FeedCursor = {
	id: string;
	createdAt: string;
};

export type FollowingFeedResponse = {
	posts: Post[];
	pagination: {
		nextCursor: FeedCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

export type UseFollowingFeedParams = {
	type?: PostType;
	enabled?: boolean;
};

const fetchFollowingFeedPage = async ({
	pageParam,
	type,
}: {
	pageParam?: FeedCursor | null;
	type?: PostType;
}): Promise<FollowingFeedResponse> => {
	const searchParams = new URLSearchParams({
		limit: "4",
	});
	if (type) searchParams.set("type", type);

	if (pageParam?.id && pageParam?.createdAt) {
		searchParams.set("cursorId", pageParam.id);
		searchParams.set("cursorCreatedAt", pageParam.createdAt);
	}

	return await httpClient
		.get("feed/following", {
			searchParams,
		})
		.json<FollowingFeedResponse>();
};

export const useFollowingFeed = ({
	type,
	enabled = true,
}: UseFollowingFeedParams = {}) => {
	return useInfiniteQuery({
		queryKey: postListQueryKeys.feedFollowing(type),
		enabled,
		queryFn: ({ pageParam }) => fetchFollowingFeedPage({ pageParam, type }),
		initialPageParam: null as FeedCursor | null,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.nextCursor ?? undefined;
		},
	});
};
