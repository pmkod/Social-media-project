import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { User as UserIcon } from "lucide-react-native";
import { cn } from "@/core/lib/utils";
import { buildImageUrl } from "@/features/post/post-media.functions";
import type { User } from "../user";

function getInitials(name?: string | null): string {
	if (!name) return "";
	const trimmed = name.trim();
	if (!trimmed) return "";
	const parts = trimmed.split(/\s+/);
	if (parts.length === 1 && parts[0]) {
		return parts[0].slice(0, 1).toUpperCase();
	}
	if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	return "";
}

type UserAvatarProps = {
	user?: User | null;
	size?: "sm" | "default" | "lg" | "xl";
	className?: string;
};

const sizeStyles = {
	sm: { container: "w-8 h-8 rounded-full", text: "text-xs", iconSize: 14 },
	default: { container: "w-10 h-10 rounded-full", text: "text-sm", iconSize: 18 },
	lg: { container: "w-14 h-14 rounded-full", text: "text-lg", iconSize: 24 },
	xl: { container: "w-20 h-20 rounded-full", text: "text-2xl", iconSize: 32 },
};

export function UserAvatar({
	user,
	size = "default",
	className,
}: UserAvatarProps) {
	const currentSize = sizeStyles[size];
	const imageUrl = buildImageUrl(
		user?.lowQualityProfilePictureFile?.filename ??
			user?.bestQualityProfilePictureFile?.filename,
	);
	const initials = getInitials(user?.fullName);

	return (
		<View
			className={cn(
				"overflow-hidden items-center justify-center bg-[#27272a] border border-[#3f3f46]",
				currentSize.container,
				className,
			)}
		>
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					style={{ width: "100%", height: "100%" }}
					contentFit="cover"
					transition={200}
				/>
			) : initials ? (
				<Text className={cn("font-semibold text-foreground", currentSize.text)}>
					{initials}
				</Text>
			) : (
				<UserIcon size={currentSize.iconSize} color="#a1a1aa" />
			)}
		</View>
	);
}
