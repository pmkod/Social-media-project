import * as React from "react";
import { Text, View } from "react-native";
import { cn } from "@/core/lib/utils";

export function FieldGroup({
	className,
	children,
	...props
}: React.ComponentProps<typeof View>) {
	return (
		<View className={cn("w-full flex-col gap-4", className)} {...props}>
			{children}
		</View>
	);
}

export function Field({
	className,
	children,
	...props
}: React.ComponentProps<typeof View>) {
	return (
		<View className={cn("w-full flex-col gap-1.5", className)} {...props}>
			{children}
		</View>
	);
}

export function FieldLabel({
	className,
	children,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			className={cn("text-sm font-medium text-foreground", className)}
			{...props}
		>
			{children}
		</Text>
	);
}

export function FieldDescription({
	className,
	children,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			className={cn("text-xs text-muted-foreground", className)}
			{...props}
		>
			{children}
		</Text>
	);
}

export function FieldError({
	error,
	className,
}: {
	error?: string | null;
	className?: string;
}) {
	if (!error) return null;
	return (
		<Text className={cn("text-xs text-destructive mt-0.5", className)}>
			{error}
		</Text>
	);
}
