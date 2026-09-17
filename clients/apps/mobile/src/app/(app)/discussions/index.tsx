import React from "react";
import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, MessageSquare, ArrowLeft } from "lucide-react-native";
import { useDiscussions } from "@/features/discussion/hooks/use-discussions";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { formatPostCreationDate } from "@/features/post/common/post.utils";
import { EmptyBlock } from "@/core/components/ui/empty-block";
import type { Discussion } from "@/features/discussion/common/discussion";

export default function DiscussionsListScreen() {
	const router = useRouter();
	const { data: authData } = useAuthenticatedUser();
	const me = authData?.user;

	const handleBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(app)/home" as any);
		}
	};

	const {
		data,
		isLoading,
		refetch,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useDiscussions();

	const discussions = data?.pages.flatMap((page) => page.discussions) ?? [];

	const renderDiscussionItem = ({ item }: { item: Discussion }) => {
		const otherMember = item.members.find((m) => m.userId !== me?.id)?.user;
		const displayName =
			item.type === "GROUP"
				? item.name || "Group Chat"
				: otherMember?.fullName || "Chat";
		const displayUsername = otherMember?.username
			? `@${otherMember.username}`
			: "";

		const lastMessageText =
			item.lastMessage?.content || (item.lastMessage ? "Sent an attachment" : "No messages yet");
		const lastMessageTime = item.lastMessage?.createdAt
			? formatPostCreationDate(item.lastMessage.createdAt)
			: "";

		return (
			<Pressable
				onPress={() =>
					router.push(`/(app)/discussions/${item.id}` as any)
				}
				className="flex-row items-center gap-3 border-b border-[#27272a]/60 px-4 py-3.5 active:bg-[#18181b]/50"
			>
				<UserAvatar user={otherMember} size="default" />

				<View className="flex-1">
					<View className="flex-row items-center justify-between">
						<Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
							{displayName}
						</Text>
						{lastMessageTime ? (
							<Text className="text-xs text-muted-foreground">
								{lastMessageTime}
							</Text>
						) : null}
					</View>

					<Text
						className={`text-xs mt-1 ${
							item.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
						}`}
						numberOfLines={1}
					>
						{lastMessageText}
					</Text>
				</View>

				{item.unreadCount > 0 && (
					<View className="h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5">
						<Text className="text-[10px] font-bold text-white">
							{item.unreadCount}
						</Text>
					</View>
				)}
			</Pressable>
		);
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#09090b]">
			{/* Top Navbar */}
			<View className="flex-row items-center justify-between border-b border-[#27272a] px-4 py-3.5">
				<View className="flex-row items-center gap-3">
					<Pressable
						onPress={handleBack}
						className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
					>
						<ArrowLeft size={22} color="#fafafa" />
					</Pressable>
					<Text className="text-lg font-bold text-foreground">Messages</Text>
				</View>
				<Pressable
					onPress={() => router.push("/(app)/discussions/new" as any)}
					className="p-1 -mr-1 rounded-full active:bg-[#18181b]"
				>
					<Plus size={22} color="#fafafa" />
				</Pressable>
			</View>

			<FlatList
				data={discussions}
				keyExtractor={(item) => item.id}
				renderItem={renderDiscussionItem}
				ListEmptyComponent={
					isLoading ? (
						<View className="py-16 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-16 px-6 items-center">
							<EmptyBlock
								title="No messages yet"
								description="Direct messages between you and other people will show up here."
							/>
							<Pressable
								onPress={() => router.push("/(app)/discussions/new" as any)}
								className="mt-6 rounded-full bg-primary px-6 py-2.5 active:opacity-80"
							>
								<Text className="text-sm font-semibold text-white">
									New Message
								</Text>
							</Pressable>
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

			{/* Floating action button */}
			<Pressable
				onPress={() => router.push("/(app)/discussions/new" as any)}
				className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/60 active:scale-95"
			>
				<Plus size={26} color="#ffffff" />
			</Pressable>
		</SafeAreaView>
	);
}
