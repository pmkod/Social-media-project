import * as React from "react";
import { Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { cn } from "@/core/lib/utils";

type AlertProps = React.ComponentProps<typeof View> & {
	colorScheme?: "default" | "destructive";
	children: React.ReactNode;
};

export function Alert({
	className,
	colorScheme = "default",
	children,
	...props
}: AlertProps) {
	return (
		<View
			role="alert"
			className={cn(
				"flex-row items-start gap-2.5 rounded-lg border p-3.5",
				colorScheme === "destructive"
					? "border-destructive/40 bg-destructive/10"
					: "border-border bg-card",
				className,
			)}
			{...props}
		>
			{colorScheme === "destructive" && (
				<AlertCircle size={18} color="#ef4444" className="mt-0.5 shrink-0" />
			)}
			<View className="flex-1">{children}</View>
		</View>
	);
}

export function AlertDescription({
	className,
	children,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			className={cn("text-sm text-destructive font-normal leading-5", className)}
			{...props}
		>
			{children}
		</Text>
	);
}
