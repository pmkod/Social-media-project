import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { clearVerification } from '@/core/auth/auth.storage';
import { useSession } from '@/core/auth/session-context';
import {
  authenticationFields,
  completeSignupSchema,
} from '@/features/authentication/authentication.schemas';
import { AuthScreen } from '@/features/authentication/components/auth-screen';
import { SubmitError } from '@/features/authentication/components/submit-error';
import { useCompleteSignup } from '@/features/authentication/hooks/use-complete-signup';

export default function CompleteSignupScreen() {
  const { completeAuthentication } = useSession();
  const completeSignup = useCompleteSignup();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { username: '' },
    validators: { onSubmit: completeSignupSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const response = await completeSignup.mutateAsync(value.username.trim());
        await clearVerification();
        await completeAuthentication(response);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to save username.');
      }
    },
  });

  return (
    <AuthScreen
      title="Choose a username"
      description="This name will be visible to other people on Chillspace.">
      <View className="gap-5">
        <SubmitError message={error} />

        <form.Field name="username" validators={{ onBlur: authenticationFields.username }}>
          {(field) => (
            <Field invalid={!field.state.meta.isValid}>
              <FieldLabel>Username</FieldLabel>
              <View className="relative justify-center">
                <Text className="text-muted-foreground absolute left-3 z-10 text-base">@</Text>
                <Input
                  className="h-13 pl-8"
                  value={field.state.value}
                  onChangeText={(value) => {
                    setError(null);
                    field.handleChange(value.replace(/^@/, ''));
                  }}
                  onBlur={field.handleBlur}
                  placeholder="johndoe"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username-new"
                  returnKeyType="done"
                  onSubmitEditing={() => void form.handleSubmit()}
                />
              </View>
              <FieldDescription>3–50 characters: letters, numbers, dots or underscores.</FieldDescription>
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
              <Text className="font-semibold">{isSubmitting ? 'Finishing…' : 'Continue'}</Text>
            </Button>
          )}
        </form.Subscribe>
      </View>
    </AuthScreen>
  );
}
