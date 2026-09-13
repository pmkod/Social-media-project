import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ImagePickerAsset } from 'expo-image-picker';

import { httpClient } from '@/core/http-clients/http-client';
import type { FeedResponse } from '@/features/post/hooks/use-following-feed';
import { postListQueryKeys } from '@/features/post/post.query-keys';
import { createPostFormData } from '@/features/post/post.service';
import type { Post } from '@/features/post/post.types';

export type PostMediaAsset = Pick<
  ImagePickerAsset,
  'assetId' | 'fileName' | 'mimeType' | 'type' | 'uri'
> & {
  file?: File;
};

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
    onSuccess: (post) => {
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        postListQueryKeys.feedFollowing(),
        (postList) => {
          if (!postList?.pages[0]) return postList;

          return {
            ...postList,
            pages: [
              {
                ...postList.pages[0],
                posts: [post, ...postList.pages[0].posts],
              },
              ...postList.pages.slice(1),
            ],
          };
        }
      );
    },
  });
}
