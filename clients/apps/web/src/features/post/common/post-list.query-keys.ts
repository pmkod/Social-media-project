import type { PostType } from "./post.ts";

const postListRootQueryKey = ["post-list"] as const;
type BookmarksQueryParams = {
	bookmarkCollectionId?: string;
};

const postListQueryKeys = {
	root: postListRootQueryKey,
	feed: () => [...postListRootQueryKey, "feed"] as const,
	feedFollowing: () => [...postListRootQueryKey, "feed", "following"] as const,
	search: (query: string, type: PostType = "POST") =>
		[
			...postListRootQueryKey,
			"search",
			query.trim().toLowerCase(),
			type,
		] as const,
	userPosts: (userId: string, type: PostType = "POST") =>
		[...postListRootQueryKey, "user", userId, type] as const,
	userLikes: (userId: string) =>
		[...postListRootQueryKey, "user-likes", userId] as const,
	bookmarks: ({ bookmarkCollectionId }: BookmarksQueryParams) =>
		bookmarkCollectionId
			? [...postListRootQueryKey, "bookmarks", { bookmarkCollectionId }]
			: [...postListRootQueryKey, "bookmarks"],
};

export type { BookmarksQueryParams };
export { postListQueryKeys };
