const postListRootQueryKey = ["post-list"] as const;

const postListQueryKeys = {
	root: postListRootQueryKey,
	feed: () => [...postListRootQueryKey, "feed"] as const,
	feedFollowing: () => [...postListRootQueryKey, "feed", "following"] as const,
	search: (query: string) =>
		[...postListRootQueryKey, "search", query.trim().toLowerCase()] as const,
	userPosts: (userId: string) =>
		[...postListRootQueryKey, "user", userId] as const,
	userLikes: (userId: string) =>
		[...postListRootQueryKey, "user-likes", userId] as const,
	bookmarks: () => [...postListRootQueryKey, "bookmarks"] as const,
	collectionPosts: (collectionId: string) =>
		[...postListRootQueryKey, "collection", collectionId] as const,
};

export { postListQueryKeys };
