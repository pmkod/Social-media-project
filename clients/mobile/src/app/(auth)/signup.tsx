import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Text } from '@/components/ui/text';
import {
  authenticationFields,
  signupSchema,
} from '@/features/authentication/authentication.schemas';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useSignup } from '@/features/authentication/hooks/use-signup';

export default function SignupScreen() {
  const router = useRouter();
  const signup = useSignup();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { fullName: '', email: '', password: '' },
    validators: { onSubmit: signupSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const verification = await signup.mutateAsync({
          fullName: value.fullName.trim(),
          email: value.email.trim().toLowerCase(),
          password: value.password,
        });
        if (!verification) throw new Error('Unable to start verification.');
        router.push({ pathname: '/verify', params: { goal: 'signup' } });
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to create account.');
      }
    },
  });

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

        <form.Field name="fullName" validators={{ onBlur: authenticationFields.fullName }}>
          {(field) => (
            <Field invalid={!field.state.meta.isValid}>
              <FieldLabel>Full name</FieldLabel>
              <Input
                className="h-13"
                value={field.state.value}
                onChangeText={(value) => {
                  setError(null);
                  field.handleChange(value);
                }}
                onBlur={field.handleBlur}
                placeholder="John Doe"
                autoCapitalize="words"
                autoComplete="name"
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="email" validators={{ onBlur: authenticationFields.email }}>
          {(field) => (
            <Field invalid={!field.state.meta.isValid}>
              <FieldLabel>Email</FieldLabel>
              <Input
                className="h-13"
                value={field.state.value}
                onChangeText={(value) => {
                  setError(null);
                  field.handleChange(value);
                }}
                onBlur={field.handleBlur}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="password" validators={{ onBlur: authenticationFields.password }}>
          {(field) => (
            <Field invalid={!field.state.meta.isValid}>
              <FieldLabel>Password</FieldLabel>
              <PasswordInput
                value={field.state.value}
                onChangeText={(value) => {
                  setError(null);
                  field.handleChange(value);
                }}
                onBlur={field.handleBlur}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={() => void form.handleSubmit()}
              />
              <FieldDescription>Use at least 8 characters.</FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              className="mt-2 h-13 rounded-xl"
              disabled={isSubmitting}
              onPress={() => void form.handleSubmit()}>
              <Text className="font-semibold">
                {isSubmitting ? 'Creating account…' : 'Create an account'}
              </Text>
            </Button>
          )}
        </form.Subscribe>
      </View>
    </AuthScreen>
  );
}
