import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { FormField } from '@/features/authentication/components/form-field';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { usePasswordReset } from '@/features/authentication/hooks/use-password-reset';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PasswordResetScreen() {
  const router = useRouter();
  const passwordReset = usePasswordReset();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!EMAIL_PATTERN.test(email.trim())) return setError('Enter a valid email address.');

    try {
      const verification = await passwordReset.mutateAsync(email.trim().toLowerCase());
      if (verification) {
        router.push({ pathname: '/verify', params: { goal: 'password_reset' } });
      } else {
        setInfo('If an account exists for this email, reset instructions have been sent.');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to request reset.');
    }
  };

  return (
    <AuthScreen
      title="Reset your password"
      description="Enter your email and we’ll send you a verification code.">
      <View className="gap-5">
        <SubmitError message={error} />
        {info ? (
          <View className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
            <Text className="text-sm leading-5 text-blue-700 dark:text-blue-300">{info}</Text>
          </View>
        ) : null}
        <FormField label="Email">
          <Input
            className="h-13"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
          />
        </FormField>
        <Button
          className="h-13 rounded-xl"
          disabled={passwordReset.isPending}
          onPress={() => void submit()}>
          <Text className="font-semibold">
            {passwordReset.isPending ? 'Sending…' : 'Send code'}
          </Text>
        </Button>
      </View>
    </AuthScreen>
  );
}
