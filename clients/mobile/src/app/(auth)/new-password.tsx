import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { clearVerification } from '@/core/auth/auth.storage';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { FormField } from '@/features/authentication/components/form-field';
import { PasswordField } from '@/features/authentication/components/password-field';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useNewPassword } from '@/features/authentication/hooks/use-new-password';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function NewPasswordScreen() {
  const router = useRouter();
  const newPassword = useNewPassword();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (password !== confirmation) return setError('Passwords do not match.');

    try {
      await newPassword.mutateAsync(password);
      await clearVerification();
      router.replace('/login');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update password.');
    }
  };

  return (
    <AuthScreen title="Create a new password" description="Choose a password you don’t use elsewhere.">
      <View className="gap-5">
        <SubmitError message={error} />
        <FormField label="New password">
          <PasswordField
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Confirm password">
          <PasswordField
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder="Repeat your password"
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
          />
        </FormField>
        <Button
          className="h-13 rounded-xl"
          disabled={newPassword.isPending}
          onPress={() => void submit()}>
          <Text className="font-semibold">
            {newPassword.isPending ? 'Updating…' : 'Update password'}
          </Text>
        </Button>
      </View>
    </AuthScreen>
  );
}
