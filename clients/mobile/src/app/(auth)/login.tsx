import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Text } from '@/components/ui/text';
import {
  authenticationFields,
  loginSchema,
} from '@/features/authentication/authentication.schemas';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useLogin } from '@/features/authentication/hooks/use-login';

export default function LoginScreen() {
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { emailOrUsername: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const verification = await login.mutateAsync({
          emailOrUsername: value.emailOrUsername.trim(),
          password: value.password,
        });
        if (!verification) throw new Error('Unable to start verification.');
        router.push({ pathname: '/verify', params: { goal: 'login' } });
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to log in.');
      }
    },
  });

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

        <form.Field
          name="emailOrUsername"
          validators={{ onBlur: authenticationFields.emailOrUsername }}>
          {(field) => (
            <Field invalid={!field.state.meta.isValid}>
              <FieldLabel>Email or username</FieldLabel>
              <Input
                className="h-13"
                value={field.state.value}
                onChangeText={(value) => {
                  setError(null);
                  field.handleChange(value);
                }}
                onBlur={field.handleBlur}
                placeholder="Email or username"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                returnKeyType="next"
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
                placeholder="••••••••"
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={() => void form.handleSubmit()}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <Pressable className="self-end" onPress={() => router.push('/password-reset')}>
          <Text className="text-muted-foreground text-sm underline">Forgot password?</Text>
        </Pressable>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              className="mt-2 h-13 rounded-xl"
              disabled={isSubmitting}
              onPress={() => void form.handleSubmit()}>
              <Text className="font-semibold">{isSubmitting ? 'Logging in…' : 'Log in'}</Text>
            </Button>
          )}
        </form.Subscribe>
      </View>
    </AuthScreen>
  );
}
