import { z } from 'zod';

import type { PostMediaAsset } from '@/features/post/post.types';

export const createPostSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Write something before publishing.')
    .max(500, 'A post cannot exceed 500 characters.'),
  medias: z
    .array(z.custom<PostMediaAsset>())
    .max(4, 'You can attach up to 4 photos or videos.'),
});
