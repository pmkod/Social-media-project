import { RefreshCw } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/brand-logo';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CreatePostComposer } from '@/features/post/components/create-post-composer';
import { PostCard } from '@/features/post/components/post-card';
import { useFollowingFeed } from '@/features/post/hooks/use-following-feed';
import { useLikePost } from '@/features/post/hooks/use-like-post';
import { useUnlikePost } from '@/features/post/hooks/use-unlike-post';
import type { Post } from '@/features/post/post.types';

export default function HomeScreen() {
  const feed = useFollowingFeed();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const posts = useMemo(() => feed.data?.pages.flatMap((page) => page.posts) ?? [], [feed.data]);

  const toggleLike = useCallback(
    (post: Post) => {
      if (post.isLikedByAuthenticatedUser) unlikePost.mutate(post.id);
      else likePost.mutate(post.id);
    },
    [likePost, unlikePost]
  );

  const fetchNextPage = () => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="border-b border-border px-4 py-3">
        <BrandLogo compact />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onToggleLike={toggleLike}
            isUpdatingLike={
              (likePost.isPending && likePost.variables === item.id) ||
              (unlikePost.isPending && unlikePost.variables === item.id)
            }
          />
        )}
        ListHeaderComponent={<CreatePostComposer />}
        ListEmptyComponent={
          feed.isLoading ? (
            <View className="items-center gap-3 px-6 py-20">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-muted-foreground">Loading your feed…</Text>
            </View>
          ) : feed.isError ? (
            <View className="items-center gap-3 px-8 py-16">
              <Text className="text-center text-xl font-bold">We couldn’t load your feed</Text>
              <Text className="text-muted-foreground text-center leading-5">
                {feed.error instanceof Error ? feed.error.message : 'Please try again.'}
              </Text>
              <Pressable
                className="mt-2 flex-row items-center gap-2 rounded-full border border-border px-4 py-2.5"
                onPress={() => void feed.refetch()}>
                <Icon as={RefreshCw} className="text-foreground" size={17} />
                <Text className="font-semibold">Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center gap-2 px-8 py-16">
              <Text className="text-xl font-bold">Your feed is quiet</Text>
              <Text className="text-muted-foreground text-center leading-5">
                Follow people or publish the first post to start the conversation.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator color="#2563eb" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefetching && !feed.isFetchingNextPage}
            onRefresh={() => void feed.refetch()}
            tintColor="#2563eb"
          />
        }
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}
