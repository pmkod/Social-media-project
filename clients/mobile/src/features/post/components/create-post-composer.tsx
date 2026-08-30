import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Send, Video, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/core/auth/session-context';
import { UserAvatar } from '@/features/post/components/user-avatar';
import { useCreatePost } from '@/features/post/hooks/use-create-post';

const MAX_MEDIA_COUNT = 4;

export function CreatePostComposer() {
  const { user } = useSession();
  const createPost = useCreatePost();
  const [text, setText] = useState('');
  const [medias, setMedias] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pickMedia = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo access to add media to your post.');
      return;
    }

    const remainingSlots = MAX_MEDIA_COUNT - medias.length;
    if (remainingSlots <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.85,
    });

    if (!result.canceled) {
      setMedias((current) => [...current, ...result.assets].slice(0, MAX_MEDIA_COUNT));
    }
  };

  const submit = async () => {
    setError(null);
    const normalizedText = text.trim();
    if (!normalizedText) {
      setError('Write something before publishing.');
      return;
    }

    try {
      await createPost.mutateAsync({ text: normalizedText, medias });
      setText('');
      setMedias([]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to publish this post.');
    }
  };

  return (
    <View className="border-b border-border bg-background px-4 pb-4 pt-3">
      <View className="flex-row items-start gap-3">
        <UserAvatar user={user} />
        <View className="min-w-0 flex-1">
          <Textarea
            className="min-h-20 border-0 px-0 py-1 text-[16px] shadow-none"
            value={text}
            onChangeText={setText}
            placeholder="What’s happening?"
            maxLength={500}
            editable={!createPost.isPending}
          />

          {medias.length > 0 ? (
            <ScrollView
              horizontal
              className="mt-3"
              contentContainerClassName="gap-2"
              showsHorizontalScrollIndicator={false}>
              {medias.map((asset, index) => (
                <View
                  key={`${asset.assetId ?? asset.uri}-${index}`}
                  className="relative h-24 w-24 overflow-hidden rounded-xl bg-muted">
                  {asset.type === 'video' ? (
                    <View className="flex-1 items-center justify-center bg-slate-900">
                      <Icon as={Video} className="text-white" size={26} />
                    </View>
                  ) : (
                    <Image source={{ uri: asset.uri }} className="size-full" contentFit="cover" />
                  )}
                  <Pressable
                    accessibilityLabel="Remove media"
                    className="absolute right-1 top-1 size-7 items-center justify-center rounded-full bg-black/70"
                    onPress={() => setMedias((current) => current.filter((_, item) => item !== index))}>
                    <Icon as={X} className="text-white" size={15} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          ) : null}

          {error ? <Text className="mt-2 text-sm text-destructive">{error}</Text> : null}

          <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
            <Pressable
              accessibilityLabel="Add photos or videos"
              disabled={medias.length >= MAX_MEDIA_COUNT || createPost.isPending}
              className="size-10 items-center justify-center rounded-full active:bg-accent disabled:opacity-40"
              onPress={() => void pickMedia()}>
              <Icon as={ImagePlus} className="text-blue-600" size={22} />
            </Pressable>

            <View className="flex-row items-center gap-3">
              <Text className="text-muted-foreground text-xs">{text.length}/500</Text>
              <Button
                size="sm"
                className="h-10 rounded-full bg-blue-600 px-5 active:bg-blue-700"
                disabled={!text.trim() || createPost.isPending}
                onPress={() => void submit()}>
                <Icon as={Send} className="text-white" size={16} />
                <Text className="font-bold text-white">
                  {createPost.isPending ? 'Posting…' : 'Post'}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
