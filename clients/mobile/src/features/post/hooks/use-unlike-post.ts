import { useMutation, useQueryClient } from '@tanstack/react-query';

import { httpClient } from '@/core/http-clients/http-client';
import { updatePostLikeCache } from '@/features/post/hooks/post-like-cache';
import type { Post } from '@/features/post/post.types';

export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      httpClient.delete(`posts/${postId}/likes`).json<{ post: Post }>(),
    onSuccess: ({ post }) => updatePostLikeCache(queryClient, post, false),
  });
}
