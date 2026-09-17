import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { useFollowUser } from "../../follow-user/use-follow-user";
import { useUnfollowUser } from "../../unfollow-user/use-unfollow-user";
import { UserAvatar } from "./user-avatar";
import type { User } from "../user";

type UserRowItemProps = {
	user: User;
	onPress?: () => void;
};

export function UserRowItem({ user, onPress }: UserRowItemProps) {
	const router = useRouter();
	const { data: authData } = useAuthenticatedUser();
	const isMe = authData?.user?.id === user.id;

	const followUser = useFollowUser();
	const unfollowUser = useUnfollowUser();

	const isFollowed = user.isFollowedByAuthenticatedUser ?? false;
	const isPending = followUser.isPending || unfollowUser.isPending;

	const handleFollowToggle = () => {
		if (isPending) return;
		if (isFollowed) {
			unfollowUser.mutate({ userId: user.id });
		} else {
			followUser.mutate({ userId: user.id });
		}
	};

	const handlePress = () => {
		if (onPress) {
			onPress();
		} else {
			router.push(`/(app)/profile/${user.username}` as any);
		}
	};

	return (
		<Pressable
			onPress={handlePress}
			className="flex-row items-center justify-between py-3.5 px-4 border-b border-[#27272a]/50 active:bg-[#18181b]/40"
		>
			<View className="flex-row items-center gap-3 flex-1 mr-3">
				<UserAvatar user={user} size="default" />
				<View className="flex-1">
					<Text className="font-semibold text-sm text-foreground" numberOfLines={1}>
						{user.fullName}
					</Text>
					<Text className="text-xs text-muted-foreground" numberOfLines={1}>
						@{user.username}
					</Text>
					{user.bio ? (
						<Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
							{user.bio}
						</Text>
					) : null}
				</View>
			</View>

			{!isMe && (
				<Pressable
					onPress={handleFollowToggle}
					disabled={isPending}
					className={`rounded-full px-4 py-1.5 border ${
						isFollowed
							? "border-[#3f3f46] bg-transparent"
							: "border-primary bg-primary"
					}`}
				>
					<Text
						className={`text-xs font-semibold ${
							isFollowed ? "text-foreground" : "text-white"
						}`}
					>
						{isFollowed ? "Following" : "Follow"}
					</Text>
				</Pressable>
			)}
		</Pressable>
	);
}
