import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, type ReactNode, useMemo } from 'react';
import { View } from 'react-native';

import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const fieldVariants = cva('w-full gap-2', {
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row items-center',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

type FieldProps = ComponentProps<typeof View> &
  VariantProps<typeof fieldVariants> & {
    invalid?: boolean;
    disabled?: boolean;
  };

function Field({ className, orientation, invalid, disabled, ...props }: FieldProps) {
  return (
    <View
      role="group"
      accessibilityState={{ disabled }}
      className={cn(
        fieldVariants({ orientation }),
        invalid && 'text-destructive',
        disabled && 'opacity-50',
        className
      )}
      {...props}
    />
  );
}

type FieldLabelProps = ComponentProps<typeof Label>;

function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <Label className={cn('text-sm font-semibold leading-snug', className)} {...props} />;
}

type FieldDescriptionProps = ComponentProps<typeof Text>;

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <Text
      className={cn('text-muted-foreground text-left text-sm font-normal leading-5', className)}
      {...props}
    />
  );
}

type FieldErrorProps = Omit<ComponentProps<typeof View>, 'children'> & {
  children?: ReactNode;
  errors?: readonly unknown[];
};

function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return null;
}

function FieldError({ className, children, errors, ...props }: FieldErrorProps) {
  const messages = useMemo(
    () => [
      ...new Set((errors ?? []).map(getErrorMessage).filter((message): message is string => !!message)),
    ],
    [errors]
  );

  if (!children && messages.length === 0) return null;

  return (
    <View role="alert" className={cn('gap-1', className)} {...props}>
      {children ? <Text className="text-destructive text-sm font-normal">{children}</Text> : null}
      {messages.map((message) => (
        <Text key={message} className="text-destructive text-sm font-normal">
          {messages.length > 1 ? `• ${message}` : message}
        </Text>
      ))}
    </View>
  );
}

export { Field, FieldDescription, FieldError, FieldLabel, fieldVariants };
export type { FieldDescriptionProps, FieldErrorProps, FieldLabelProps, FieldProps };
