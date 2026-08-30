import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <SafeAreaView className="mx-auto w-full max-w-lg flex-1 px-6 pb-5 pt-4">
        <View className="items-center pt-2">
          <BrandLogo inverted />
        </View>

        <View className="flex-1 items-center justify-center px-3">
          <View className="mb-7 h-20 w-20 items-center justify-center rounded-[28px] border border-white/20 bg-white/10">
            <Text className="text-4xl font-black text-white">C</Text>
          </View>
          <Text className="text-center text-4xl font-bold leading-[46px] tracking-tight text-white">
            A space to share, connect, and find your people.
          </Text>
          <Text className="mt-5 max-w-sm text-center text-base leading-6 text-slate-300">
            Join the conversations that matter and make every moment feel a little closer.
          </Text>
        </View>

        <View className="gap-3 pb-2">
          <Button
            className="h-14 rounded-2xl bg-white active:bg-slate-100"
            onPress={() => router.push('/login')}>
            <Text className="text-base font-bold text-slate-950">Login</Text>
          </Button>
          <Button
            variant="outline"
            className="h-14 rounded-2xl border-white/30 bg-white/10 active:bg-white/20"
            onPress={() => router.push('/signup')}>
            <Text className="text-base font-bold text-white">Sign up</Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#2563eb',
    opacity: 0.22,
  },
  orbTop: {
    top: -160,
    right: -130,
  },
  orbBottom: {
    bottom: -180,
    left: -150,
  },
});
