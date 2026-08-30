const postListRootQueryKey = ['post-list'] as const;

export const postListQueryKeys = {
  root: postListRootQueryKey,
  feed: () => [...postListRootQueryKey, 'feed'] as const,
  feedFollowing: () => [...postListRootQueryKey, 'feed', 'following'] as const,
};
