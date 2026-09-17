import * as React from "react";
import { Text, View } from "react-native";
import { cn } from "@/core/lib/utils";

type LogoProps = {
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
};

export function Logo({ className, size = "md" }: LogoProps) {
	const sizeClasses = {
		sm: "text-xl",
		md: "text-2xl",
		lg: "text-3xl",
		xl: "text-4xl",
	}[size];

	return (
		<View className="flex-row items-center">
			<Text
				className={cn(
					"font-bold text-foreground tracking-tight",
					sizeClasses,
					className,
				)}
			>
				Chillspace
			</Text>
		</View>
	);
}
