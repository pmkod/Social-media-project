import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { clearVerification } from '@/core/auth/auth.storage';
import { useSession } from '@/core/auth/session-context';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { FormField } from '@/features/authentication/components/form-field';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useCompleteSignup } from '@/features/authentication/hooks/use-complete-signup';
import { useState } from 'react';
import { View } from 'react-native';

export default function CompleteSignupScreen() {
  const { completeAuthentication } = useSession();
  const completeSignup = useCompleteSignup();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const normalizedUsername = username.trim().replace(/^@/, '');
    if (normalizedUsername.length < 3) return setError('Username must be at least 3 characters.');
    if (normalizedUsername.length > 50) return setError('Username must be 50 characters or less.');
    if (!/^[a-zA-Z0-9._]+$/.test(normalizedUsername)) {
      return setError('Use only letters, numbers, dots, and underscores.');
    }

    try {
      const response = await completeSignup.mutateAsync(normalizedUsername);
      await clearVerification();
      await completeAuthentication(response);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save username.');
    }
  };

  return (
    <AuthScreen
      title="Choose a username"
      description="This name will be visible to other people on Chillspace.">
      <View className="gap-5">
        <SubmitError message={error} />
        <FormField label="Username">
          <View className="relative justify-center">
            <Text className="text-muted-foreground absolute left-3 z-10 text-base">@</Text>
            <Input
              className="h-13 pl-8"
              value={username}
              onChangeText={setUsername}
              placeholder="johndoe"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username-new"
              returnKeyType="done"
              onSubmitEditing={() => void submit()}
            />
          </View>
        </FormField>
        <Button
          className="h-13 rounded-xl"
          disabled={completeSignup.isPending}
          onPress={() => void submit()}>
          <Text className="font-semibold">
            {completeSignup.isPending ? 'Finishing…' : 'Continue'}
          </Text>
        </Button>
      </View>
    </AuthScreen>
  );
}
