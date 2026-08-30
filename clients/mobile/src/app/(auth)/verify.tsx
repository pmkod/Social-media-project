import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { clearVerification } from '@/core/auth/auth.storage';
import { useSession } from '@/core/auth/session-context';
import { isVerificationGoal } from '@/features/authentication/auth.utils';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { FormField } from '@/features/authentication/components/form-field';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useCompleteLogin } from '@/features/authentication/hooks/use-complete-login';
import { useResendVerificationCode } from '@/features/authentication/hooks/use-resend-verification-code';
import { useUserVerification } from '@/features/authentication/hooks/use-user-verification';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function VerificationScreen() {
  const router = useRouter();
  const { completeAuthentication } = useSession();
  const { goal: rawGoal } = useLocalSearchParams<{ goal?: string }>();
  const goal = isVerificationGoal(rawGoal) ? rawGoal : null;
  const verification = useUserVerification();
  const completeLogin = useCompleteLogin();
  const resendVerificationCode = useResendVerificationCode();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const isSubmitting = verification.isPending || completeLogin.isPending;

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!goal) return setError('This verification link is invalid.');
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit verification code.');

    try {
      await verification.mutateAsync(code);
      if (goal === 'login') {
        const response = await completeLogin.mutateAsync();
        await clearVerification();
        await completeAuthentication(response);
      } else if (goal === 'signup') {
        router.replace('/complete-signup');
      } else {
        router.replace('/new-password');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to verify code.');
    }
  };

  const resend = async () => {
    setError(null);
    setInfo(null);
    try {
      await resendVerificationCode.mutateAsync();
      setInfo('A new verification code was sent to your email.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to resend code.');
    }
  };

  return (
    <AuthScreen
      title="Verification"
      description="Enter the 6-digit code sent to your email address.">
      <View className="gap-5">
        <SubmitError message={error} />
        {info ? (
          <View className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <Text className="text-sm leading-5 text-emerald-700 dark:text-emerald-300">
              {info}
            </Text>
          </View>
        ) : null}
        <FormField label="Verification code">
          <Input
            className="h-14 text-center text-2xl font-bold tracking-[10px]"
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
          />
        </FormField>
        <Button
          className="h-13 rounded-xl"
          disabled={isSubmitting || !goal}
          onPress={() => void submit()}>
          <Text className="font-semibold">{isSubmitting ? 'Verifying…' : 'Verify'}</Text>
        </Button>
        <View className="flex-row items-center justify-center gap-1">
          <Text className="text-muted-foreground text-sm">Didn&apos;t receive a code?</Text>
          <Pressable disabled={resendVerificationCode.isPending} onPress={() => void resend()}>
            <Text className="text-sm font-semibold underline">
              {resendVerificationCode.isPending ? 'Sending…' : 'Resend'}
            </Text>
          </Pressable>
        </View>
      </View>
    </AuthScreen>
  );
}
