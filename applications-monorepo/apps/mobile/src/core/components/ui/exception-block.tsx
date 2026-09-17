import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";
import { cn } from "@/core/lib/utils";

type ExceptionBlockProps = {
	title?: React.ReactNode;
	description?: React.ReactNode;
	onRefresh?: () => void;
	isRefetching?: boolean;
	bordered?: boolean;
	className?: string;
};

export function ExceptionBlock({
	title = "Something went wrong",
	description,
	onRefresh,
	isRefetching = false,
	bordered = false,
	className,
}: ExceptionBlockProps) {
	return (
		<View
			className={cn(
				"items-center justify-center py-12 px-6 rounded-xl",
				bordered && "border border-destructive/30 bg-destructive/5",
				className,
			)}
		>
			<View className="mb-3 rounded-full bg-destructive/10 p-3">
				<AlertCircle size={24} color="#bc243c" />
			</View>
			<Text className="text-base font-semibold text-foreground text-center">
				{title}
			</Text>
			{description ? (
				<Text className="text-sm text-muted-foreground text-center mt-1 max-w-xs">
					{description}
				</Text>
			) : null}
			{onRefresh ? (
				<Pressable
					onPress={onRefresh}
					disabled={isRefetching}
					className="mt-4 flex-row items-center gap-2 rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2"
				>
					{isRefetching ? (
						<ActivityIndicator size="small" color="#fafafa" />
					) : (
						<RefreshCw size={14} color="#fafafa" />
					)}
					<Text className="text-xs font-medium text-foreground">Try again</Text>
				</Pressable>
			) : null}
		</View>
	);
}
