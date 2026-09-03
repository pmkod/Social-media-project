import {
	type UseFollowingFeedParams,
	useFollowingFeed,
} from "@/features/post/feed/use-following-feed.ts";

export type UseFollowingChillzFeedParams = Omit<UseFollowingFeedParams, "type">;

/** Chillz from the current user and followed accounts, with cursor pagination. */
export const useFollowingChillzFeed = (
	params: UseFollowingChillzFeedParams = {},
) => useFollowingFeed({ ...params, type: "CHILLZ" });
