import React, { useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Heart, MessageCircle, UserPlus } from "lucide-react-native";
import { cn } from "@/core/lib/utils";
import { useNotifications } from "@/features/notification/list/use-notifications";
import { useMarkNotificationsSeen } from "@/features/notification/mark-notifications-seen/use-mark-notifications-seen";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { formatPostCreationDate } from "@/features/post/common/post.utils";
import { EmptyBlock } from "@/core/components/ui/empty-block";
import type { NotificationRecord } from "@/features/notification/common/notification";

export default function NotificationsScreen() {
	const router = useRouter();
	const {
		data,
		isLoading,
		refetch,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useNotifications();

	const markSeen = useMarkNotificationsSeen();

	useEffect(() => {
		markSeen.mutate();
	}, []);

	const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

	const renderNotificationItem = ({ item }: { item: NotificationRecord }) => {
		let icon = <Heart size={14} color="#bc243c" fill="#bc243c" />;
		let text = "interacted with you";

		switch (item.eventType) {
			case "FOLLOW":
				icon = <UserPlus size={14} color="#3b82f6" />;
				text = "started following you";
				break;
			case "POST_LIKE":
				icon = <Heart size={14} color="#bc243c" fill="#bc243c" />;
				text = "liked your post";
				break;
			case "COMMENT_LIKE":
				icon = <Heart size={14} color="#bc243c" fill="#bc243c" />;
				text = "liked your comment";
				break;
			case "POST_COMMENT":
				icon = <MessageCircle size={14} color="#10b981" />;
				text = "commented on your post";
				break;
			case "COMMENT_REPLY":
				icon = <MessageCircle size={14} color="#10b981" />;
				text = "replied to your comment";
				break;
		}

		const handlePress = () => {
			if (item.targetId) {
				if (item.eventType === "FOLLOW") {
					if (item.initiator) {
						router.push(`/(app)/profile/${item.initiator.username}` as any);
					}
				} else {
					router.push(`/(app)/posts/${item.targetId}` as any);
				}
			} else if (item.initiator) {
				router.push(`/(app)/profile/${item.initiator.username}` as any);
			}
		};

		return (
			<Pressable
				onPress={handlePress}
				className={cn(
					"flex-row items-center gap-3 border-b border-[#27272a]/60 px-4 py-3.5 active:bg-[#18181b]/50",
					!item.isSeen && "bg-[#18181b]/20",
				)}
			>
				<View className="relative">
					<UserAvatar user={item.initiator} size="default" />
					<View className="absolute -bottom-1 -right-1 rounded-full bg-[#18181b] p-1 border border-[#27272a]">
						{icon}
					</View>
				</View>

				<View className="flex-1">
					<Text className="text-sm text-foreground">
						<Text className="font-semibold">{item.initiator?.fullName || "Someone"}</Text>{" "}
						{text}
					</Text>
					<Text className="text-xs text-muted-foreground mt-0.5">
						{formatPostCreationDate(item.createdAt)}
					</Text>
				</View>

				{!item.isSeen && (
					<View className="h-2 w-2 rounded-full bg-primary" />
				)}
			</Pressable>
		);
	};

	return (
		<View className="flex-1 bg-[#09090b]">
			<View className="border-b border-[#27272a] px-4 py-3.5">
				<Text className="text-lg font-bold text-foreground">Notifications</Text>
			</View>

			<FlatList
				data={notifications}
				keyExtractor={(item) => item.id}
				renderItem={renderNotificationItem}
				ListEmptyComponent={
					isLoading ? (
						<View className="py-16 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-16 px-6 items-center">
							<EmptyBlock
								title="No notifications yet"
								description="When someone likes your posts, comments or follows you, you'll see it here."
							/>
						</View>
					)
				}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={refetch}
						tintColor="#bc243c"
						colors={["#bc243c"]}
					/>
				}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.4}
				ListFooterComponent={
					isFetchingNextPage ? (
						<View className="py-4 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : null
				}
			/>
		</View>
	);
}
