import { useMutation, useQueryClient } from '@tanstack/react-query';

import { httpClient } from '@/core/http-clients/http-client';
import { postListQueryKeys } from '@/features/post/post.query-keys';
import { createPostFormData } from '@/features/post/post.service';
import type { Post, PostMediaAsset } from '@/features/post/post.types';

type CreatePostInput = {
  text: string;
  medias: PostMediaAsset[];
};

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, medias }: CreatePostInput) => {
      const response = await httpClient
        .post('posts', { body: createPostFormData(text, medias) })
        .json<{ message: string; post: Post }>();
      return response.post;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postListQueryKeys.root }),
  });
}
