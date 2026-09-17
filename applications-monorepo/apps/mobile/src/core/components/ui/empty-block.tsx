import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { cn } from "@/core/lib/utils";

type EmptyBlockProps = {
	title: React.ReactNode;
	description?: React.ReactNode;
	onRefresh?: () => void;
	isRefetching?: boolean;
	bordered?: boolean;
	className?: string;
};

export function EmptyBlock({
	title,
	description,
	onRefresh,
	isRefetching = false,
	bordered = false,
	className,
}: EmptyBlockProps) {
	return (
		<View
			className={cn(
				"items-center justify-center py-12 px-6 rounded-xl",
				bordered && "border border-[#27272a] bg-[#18181b]/50",
				className,
			)}
		>
			<Text className="text-base font-semibold text-foreground text-center">
				{title}
			</Text>
			{description ? (
				<Text className="text-sm text-muted-foreground text-center mt-2 max-w-xs">
					{description}
				</Text>
			) : null}
			{onRefresh ? (
				<Pressable
					onPress={onRefresh}
					disabled={isRefetching}
					className="mt-4 flex-row items-center gap-2 rounded-lg border border-[#27272a] bg-[#27272a]/50 px-4 py-2"
				>
					{isRefetching ? (
						<ActivityIndicator size="small" color="#fafafa" />
					) : (
						<RefreshCw size={14} color="#fafafa" />
					)}
					<Text className="text-xs font-medium text-foreground">Refresh</Text>
				</Pressable>
			) : null}
		</View>
	);
}
