import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import { feedQueryKey } from "./feed.query-key.ts";

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

export type GetFollowingFeedResponse = FollowingFeedResponse;

export const fetchFollowingFeedPage = async ({
	pageParam,
}: {
	pageParam?: FeedCursor | null;
}): Promise<FollowingFeedResponse> => {
	const searchParams = new URLSearchParams({
		limit: "4",
	});

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

export const useFollowingFeed = () => {
	return useInfiniteQuery({
		queryKey: feedQueryKey.buildFollowing(),
		queryFn: ({ pageParam }) => fetchFollowingFeedPage({ pageParam }),
		initialPageParam: null as FeedCursor | null,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.nextCursor ?? undefined;
		},
	});
};
