import type { ImagePickerAsset } from 'expo-image-picker';

export type PostMediaAsset = Pick<
  ImagePickerAsset,
  'assetId' | 'fileName' | 'mimeType' | 'type' | 'uri'
> & {
  file?: File;
};

export type PostAuthor = {
  id: string;
  fullName: string | null;
  username: string;
  lowQualityProfilePictureFile?: { filename: string } | null;
  bestQualityProfilePictureFile?: { filename: string } | null;
};

export type PostMedia = {
  id: string;
  position?: number;
  mediaType?: 'IMAGE' | 'VIDEO' | string;
  lowQualityFile?: { filename?: string; url?: string } | null;
  highQualityFile?: { filename?: string; url?: string } | null;
};

export type Post = {
  id: string;
  author: PostAuthor | null;
  text?: string | null;
  content?: string | null;
  medias?: PostMedia[];
  likesCount?: number;
  commentsCount?: number;
  isLikedByAuthenticatedUser?: boolean;
  isBookmarkedByAuthenticatedUser?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type FeedCursor = {
  id: string;
  createdAt: string;
};

export type FeedResponse = {
  posts: Post[];
  pagination: {
    nextCursor: FeedCursor | null;
    hasNextPage: boolean;
    limit: number;
  };
};
