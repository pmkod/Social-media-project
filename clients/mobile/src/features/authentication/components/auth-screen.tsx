import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthScreenProps = PropsWithChildren<{
  title: string;
  description: string;
  footer?: ReactNode;
}>;

export function AuthScreen({ children, title, description, footer }: AuthScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          <View className="mx-auto w-full max-w-md flex-1 px-6 pb-8 pt-2">
            <View className="flex-row items-center justify-between">
              <Button
                accessibilityLabel="Go back"
                variant="ghost"
                size="icon"
                onPress={() => router.back()}>
                <Icon as={ArrowLeft} size={21} />
              </Button>
              <BrandLogo compact />
              <View className="size-10" />
            </View>

            <View className="flex-1 justify-center py-10">
              <View className="mb-8 gap-2">
                <Text className="text-3xl font-bold tracking-tight">{title}</Text>
                <Text className="text-muted-foreground leading-6">{description}</Text>
              </View>
              {children}
            </View>

            {footer ? <View className="pt-4">{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
