import { useInfiniteQuery } from '@tanstack/react-query';

import { httpClient } from '@/core/http-clients/http-client';
import { postListQueryKeys } from '@/features/post/post.query-keys';
import type { FeedCursor, FeedResponse } from '@/features/post/post.types';

async function fetchFollowingFeedPage(pageParam?: FeedCursor | null) {
  const searchParams = new URLSearchParams({ limit: '10', type: 'POST' });
  if (pageParam?.id && pageParam.createdAt) {
    searchParams.set('cursorId', pageParam.id);
    searchParams.set('cursorCreatedAt', pageParam.createdAt);
  }

  return httpClient.get('feed/following', { searchParams }).json<FeedResponse>();
}

export function useFollowingFeed() {
  return useInfiniteQuery({
    queryKey: postListQueryKeys.feedFollowing(),
    queryFn: ({ pageParam }) => fetchFollowingFeedPage(pageParam),
    initialPageParam: null as FeedCursor | null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  });
}
