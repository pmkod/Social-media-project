import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  authenticationFields,
  passwordResetSchema,
} from '@/features/authentication/authentication.schemas';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { usePasswordReset } from '@/features/authentication/hooks/use-password-reset';

export default function PasswordResetScreen() {
  const router = useRouter();
  const passwordReset = usePasswordReset();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { email: '' },
    validators: { onSubmit: passwordResetSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setInfo(null);
      try {
        const verification = await passwordReset.mutateAsync(value.email.trim().toLowerCase());
        if (verification) {
          router.push({ pathname: '/verify', params: { goal: 'password_reset' } });
        } else {
          setInfo('If an account exists for this email, reset instructions have been sent.');
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to request reset.');
      }
    },
  });

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

        <form.Field name="email" validators={{ onBlur: authenticationFields.email }}>
          {(field) => (
            <Field invalid={!field.state.meta.isValid}>
              <FieldLabel>Email</FieldLabel>
              <Input
                className="h-13"
                value={field.state.value}
                onChangeText={(value) => {
                  setError(null);
                  setInfo(null);
                  field.handleChange(value);
                }}
                onBlur={field.handleBlur}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={() => void form.handleSubmit()}
              />
              <FieldDescription>We will send a verification code to this address.</FieldDescription>
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
              <Text className="font-semibold">{isSubmitting ? 'Sending…' : 'Send code'}</Text>
            </Button>
          )}
        </form.Subscribe>
      </View>
    </AuthScreen>
  );
}
