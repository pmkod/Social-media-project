import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { FormField } from '@/features/authentication/components/form-field';
import { PasswordField } from '@/features/authentication/components/password-field';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useLogin } from '@/features/authentication/hooks/use-login';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const login = useLogin();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!emailOrUsername.trim()) {
      setError('Email or username is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const verification = await login.mutateAsync({
        emailOrUsername: emailOrUsername.trim(),
        password,
      });
      if (!verification) throw new Error('Unable to start verification.');
      router.push({ pathname: '/verify', params: { goal: 'login' } });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to log in.');
    }
  };

  return (
    <AuthScreen
      title="Log in"
      description="Enter your credentials to access your account."
      footer={
        <View className="flex-row items-center justify-center gap-1">
          <Text className="text-muted-foreground text-sm">Not signed up yet?</Text>
          <Pressable onPress={() => router.replace('/signup')}>
            <Text className="text-sm font-semibold underline">Sign up</Text>
          </Pressable>
        </View>
      }>
      <View className="gap-5">
        <SubmitError message={error} />
        <FormField label="Email or username">
          <Input
            className="h-13"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            placeholder="Email or username"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
          />
        </FormField>

        <FormField label="Password">
          <PasswordField
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
          />
        </FormField>

        <Pressable className="self-end" onPress={() => router.push('/password-reset')}>
          <Text className="text-muted-foreground text-sm underline">Forgot password?</Text>
        </Pressable>

        <Button
          className="mt-2 h-13 rounded-xl"
          disabled={login.isPending}
          onPress={() => void submit()}>
          <Text className="font-semibold">{login.isPending ? 'Logging in…' : 'Log in'}</Text>
        </Button>
      </View>
    </AuthScreen>
  );
}
