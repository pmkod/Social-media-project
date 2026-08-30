import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserAvatar } from '@/features/post/components/user-avatar';
import { buildMediaUrl } from '@/features/post/post.service';
import type { Post, PostMedia } from '@/features/post/post.types';
import { Image } from 'expo-image';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Play } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

type PostCardProps = {
  post: Post;
  isUpdatingLike?: boolean;
  onToggleLike: (post: Post) => void;
};

function formatPostDate(value: string) {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getMediaData(media: PostMedia) {
  const file = media.lowQualityFile ?? media.highQualityFile;
  const filename = file?.filename ?? file?.url;
  const isVideo = media.mediaType?.toUpperCase() === 'VIDEO' || /\.(mp4|webm|ogg)$/i.test(filename ?? '');
  return { isVideo, url: buildMediaUrl(filename, isVideo) };
}

function PostMediaPreview({ medias }: { medias: PostMedia[] }) {
  const first = medias[0];
  if (!first) return null;
  const { isVideo, url } = getMediaData(first);
  if (!url) return null;

  return (
    <View className="mt-3 overflow-hidden rounded-2xl border border-border bg-muted" style={styles.media}>
      {isVideo ? (
        <View className="flex-1 items-center justify-center bg-slate-900">
          <View className="size-14 items-center justify-center rounded-full bg-white/15">
            <Icon as={Play} className="text-white" size={27} fill="white" />
          </View>
          <Text className="mt-2 text-sm font-semibold text-white">Video</Text>
        </View>
      ) : (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      )}
      {medias.length > 1 ? (
        <View className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1">
          <Text className="text-xs font-bold text-white">+{medias.length - 1}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function PostCard({ post, isUpdatingLike = false, onToggleLike }: PostCardProps) {
  const authorName = post.author?.fullName || 'Chillspace user';
  const username = post.author?.username || 'user';
  const isLiked = post.isLikedByAuthenticatedUser ?? false;

  return (
    <View className="border-b border-border bg-background px-4 py-4">
      <View className="flex-row items-start gap-3">
        <UserAvatar user={post.author} />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Text className="shrink font-bold" numberOfLines={1}>
                {authorName}
              </Text>
              <Text className="text-muted-foreground shrink text-sm" numberOfLines={1}>
                @{username}
              </Text>
              <Text className="text-muted-foreground text-sm">· {formatPostDate(post.createdAt)}</Text>
            </View>
            <Icon as={MoreHorizontal} className="text-muted-foreground" size={19} />
          </View>

          {post.text || post.content ? (
            <Text className="mt-1 text-[15px] leading-6">{post.text || post.content}</Text>
          ) : null}

          <PostMediaPreview medias={post.medias ?? []} />

          <View className="mt-3 flex-row items-center justify-between pr-1">
            <Pressable
              accessibilityLabel={isLiked ? 'Unlike post' : 'Like post'}
              accessibilityRole="button"
              disabled={isUpdatingLike}
              className="flex-row items-center gap-1.5 rounded-full py-1 pr-3"
              onPress={() => onToggleLike(post)}>
              {isUpdatingLike ? (
                <ActivityIndicator size="small" />
              ) : (
                <Icon
                  as={Heart}
                  className={isLiked ? 'text-rose-500' : 'text-muted-foreground'}
                  size={22}
                  fill={isLiked ? '#f43f5e' : 'transparent'}
                />
              )}
              <Text className={isLiked ? 'text-sm text-rose-500' : 'text-muted-foreground text-sm'}>
                {post.likesCount ?? 0}
              </Text>
            </Pressable>

            <View className="flex-row items-center gap-1.5 py-1">
              <Icon as={MessageCircle} className="text-muted-foreground" size={21} />
              <Text className="text-muted-foreground text-sm">{post.commentsCount ?? 0}</Text>
            </View>

            <View className="py-1">
              <Icon
                as={Bookmark}
                className="text-muted-foreground"
                size={21}
                fill={post.isBookmarkedByAuthenticatedUser ? 'currentColor' : 'transparent'}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
});
