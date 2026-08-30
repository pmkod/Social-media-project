import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ImagePickerAsset } from 'expo-image-picker';

import { httpClient } from '@/core/http-clients/http-client';
import { postListQueryKeys } from '@/features/post/post.query-keys';
import { createPostFormData } from '@/features/post/post.service';
import type { Post } from '@/features/post/post.types';

type CreatePostInput = {
  text: string;
  medias: ImagePickerAsset[];
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
