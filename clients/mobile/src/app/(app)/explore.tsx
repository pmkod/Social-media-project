import { LogOut, Search, UserRound } from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSession } from '@/core/auth/session-context';
import { useLogout } from '@/features/authentication/hooks/use-logout';
import { UserAvatar } from '@/features/post/components/user-avatar';

export default function ExploreScreen() {
  const { user, signOut } = useSession();
  const logoutMutation = useLogout();

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // A local sign-out must still succeed when the API is unavailable.
    } finally {
      await signOut();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="border-b border-border px-4 py-4">
        <Text className="text-2xl font-bold tracking-tight">Explore</Text>
        <View className="relative mt-4 justify-center">
          <Icon as={Search} className="text-muted-foreground absolute left-3 z-10" size={19} />
          <Input className="h-12 rounded-xl pl-10" placeholder="Search Chillspace" />
        </View>
      </View>

      <View className="gap-5 p-4">
        <View className="rounded-2xl border border-border bg-card p-5">
          <View className="flex-row items-center gap-4">
            <UserAvatar user={user} className="size-16" />
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-bold" numberOfLines={1}>
                {user?.fullName || 'Chillspace user'}
              </Text>
              <Text className="text-muted-foreground mt-1" numberOfLines={1}>
                @{user?.username || 'user'}
              </Text>
              <Text className="text-muted-foreground mt-0.5 text-sm" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-2xl border border-border bg-card p-5">
          <View className="flex-row items-center gap-3">
            <View className="size-10 items-center justify-center rounded-full bg-blue-600/10">
              <Icon as={UserRound} className="text-blue-600" size={20} />
            </View>
            <View className="flex-1">
              <Text className="font-bold">Your space</Text>
              <Text className="text-muted-foreground mt-0.5 text-sm">
                Profile editing and discovery can grow from here.
              </Text>
            </View>
          </View>
        </View>

        <Button
          variant="outline"
          className="h-12 rounded-xl border-destructive/30"
          disabled={logoutMutation.isPending}
          onPress={() => void logout()}>
          <Icon as={LogOut} className="text-destructive" size={19} />
          <Text className="font-semibold text-destructive">
            {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
