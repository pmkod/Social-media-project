import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { postListQueryKeys } from '@/features/post/post.query-keys';
import type { FeedResponse, Post } from '@/features/post/post.types';

export function updatePostLikeCache(queryClient: QueryClient, updatedPost: Post, liked: boolean) {
  queryClient.setQueriesData<InfiniteData<FeedResponse>>(
    { queryKey: postListQueryKeys.root, exact: false },
    (oldData) => {
      if (!oldData) return undefined;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          posts: page.posts.map((post) =>
            post.id === updatedPost.id
              ? {
                  ...post,
                  likesCount: updatedPost.likesCount,
                  isLikedByAuthenticatedUser: liked,
                }
              : post
          ),
        })),
      };
    }
  );
}
