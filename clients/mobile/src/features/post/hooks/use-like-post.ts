import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { httpClient } from '@/core/http-clients/http-client';
import type { FeedResponse } from '@/features/post/hooks/use-following-feed';
import { postListQueryKeys } from '@/features/post/post.query-keys';
import type { Post } from '@/features/post/post.types';

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      httpClient.post(`posts/${postId}/likes`).json<{ post: Post }>(),
    onSuccess: ({ post: updatedPost }) => {
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
                      isLikedByAuthenticatedUser: true,
                    }
                  : post
              ),
            })),
          };
        }
      );
    },
  });
}
