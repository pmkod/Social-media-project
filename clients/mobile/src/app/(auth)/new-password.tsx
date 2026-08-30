import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { Text } from '@/components/ui/text';
import { clearVerification } from '@/core/auth/auth.storage';
import {
  authenticationFields,
  newPasswordSchema,
} from '@/features/authentication/authentication.schemas';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useNewPassword } from '@/features/authentication/hooks/use-new-password';

export default function NewPasswordScreen() {
  const router = useRouter();
  const newPassword = useNewPassword();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { password: '', confirmation: '' },
    validators: { onSubmit: newPasswordSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await newPassword.mutateAsync(value.password);
        await clearVerification();
        router.replace('/login');
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to update password.');
      }
    },
  });

  return (
    <AuthScreen title="Create a new password" description="Choose a password you don’t use elsewhere.">
      <View className="gap-5">
        <SubmitError message={error} />

        <form.Field name="password" validators={{ onBlur: authenticationFields.password }}>
          {(field) => (
            <Field invalid={!field.state.meta.isValid}>
              <FieldLabel>New password</FieldLabel>
              <PasswordInput
                value={field.state.value}
                onChangeText={(value) => {
                  setError(null);
                  field.handleChange(value);
                }}
                onBlur={field.handleBlur}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <FieldDescription>Use at least 8 characters.</FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field
          name="confirmation"
          validators={{ onBlur: authenticationFields.passwordConfirmation }}>
          {(field) => (
            <Field invalid={!field.state.meta.isValid}>
              <FieldLabel>Confirm password</FieldLabel>
              <PasswordInput
                value={field.state.value}
                onChangeText={(value) => {
                  setError(null);
                  field.handleChange(value);
                }}
                onBlur={field.handleBlur}
                placeholder="Repeat your password"
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={() => void form.handleSubmit()}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              className="h-13 rounded-xl"
              disabled={isSubmitting}
              onPress={() => void form.handleSubmit()}>
              <Text className="font-semibold">
                {isSubmitting ? 'Updating…' : 'Update password'}
              </Text>
            </Button>
          )}
        </form.Subscribe>
      </View>
    </AuthScreen>
  );
}
