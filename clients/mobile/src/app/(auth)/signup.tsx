import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { FormField } from '@/features/authentication/components/form-field';
import { PasswordField } from '@/features/authentication/components/password-field';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useSignup } from '@/features/authentication/hooks/use-signup';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

const EMAIL_PATTERN = /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignupScreen() {
  const router = useRouter();
  const signup = useSignup();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!fullName.trim()) return setError('Full name is required.');
    if (!EMAIL_PATTERN.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');

    try {
      const verification = await signup.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      if (!verification) throw new Error('Unable to start verification.');
      router.push({ pathname: '/verify', params: { goal: 'signup' } });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create account.');
    }
  };

  return (
    <AuthScreen
      title="Create an account"
      description="Join us in just a few seconds."
      footer={
        <View className="flex-row items-center justify-center gap-1">
          <Text className="text-muted-foreground text-sm">Already have an account?</Text>
          <Pressable onPress={() => router.replace('/login')}>
            <Text className="text-sm font-semibold underline">Log in</Text>
          </Pressable>
        </View>
      }>
      <View className="gap-5">
        <SubmitError message={error} />
        <FormField label="Full name">
          <Input
            className="h-13"
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            autoCapitalize="words"
            autoComplete="name"
          />
        </FormField>
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
          />
        </FormField>
        <FormField label="Password">
          <PasswordField
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
          />
        </FormField>
        <Button
          className="mt-2 h-13 rounded-xl"
          disabled={signup.isPending}
          onPress={() => void submit()}>
          <Text className="font-semibold">
            {signup.isPending ? 'Creating account…' : 'Create an account'}
          </Text>
        </Button>
      </View>
    </AuthScreen>
  );
}
