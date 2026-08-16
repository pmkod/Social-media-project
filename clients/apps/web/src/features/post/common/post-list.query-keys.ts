const postListRootQueryKey = ["post-list"] as const;

const postListQueryKeys = {
	root: postListRootQueryKey,
	feed: () => [...postListRootQueryKey, "feed"] as const,
	feedFollowing: () => [...postListRootQueryKey, "feed", "following"] as const,
	userPosts: (userId: string) => [...postListRootQueryKey, "user", userId] as const,
	userLikes: (userId: string) => [...postListRootQueryKey, "user-likes", userId] as const,
};

export { postListQueryKeys, postListRootQueryKey };
