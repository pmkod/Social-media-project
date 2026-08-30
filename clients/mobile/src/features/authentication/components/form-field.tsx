import { Text } from '@/components/ui/text';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

type FormFieldProps = PropsWithChildren<{
  label: string;
  error?: string | null;
}>;

export function FormField({ children, label, error }: FormFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold">{label}</Text>
      {children}
      {error ? <Text className="text-destructive text-sm">{error}</Text> : null}
    </View>
  );
}
