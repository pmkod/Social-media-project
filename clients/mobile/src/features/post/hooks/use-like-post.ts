import { useMutation, useQueryClient } from '@tanstack/react-query';

import { httpClient } from '@/core/http-clients/http-client';
import { updatePostLikeCache } from '@/features/post/hooks/post-like-cache';
import type { Post } from '@/features/post/post.types';

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      httpClient.post(`posts/${postId}/likes`).json<{ post: Post }>(),
    onSuccess: ({ post }) => updatePostLikeCache(queryClient, post, true),
  });
}
