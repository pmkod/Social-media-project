import React, { useState } from "react";
import {
	View,
	Text,
	FlatList,
	TextInput,
	Pressable,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import { useDiscussion } from "@/features/discussion/hooks/use-discussion";
import { useMessages } from "@/features/discussion/hooks/use-messages";
import { useCreateMessage } from "@/features/discussion/hooks/use-create-message";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { formatPostCreationDate } from "@/features/post/common/post.utils";
import type { Message } from "@/features/discussion/common/discussion";

export default function DiscussionDetailScreen() {
	const router = useRouter();
	const { discussionId } = useLocalSearchParams<{ discussionId: string }>();
	const { data: authData } = useAuthenticatedUser();
	const me = authData?.user;

	const [inputText, setInputText] = useState("");

	const { data: discussionData, isLoading: isDiscussionLoading } = useDiscussion(
		discussionId || "",
	);
	const {
		data: messagesData,
		isLoading: isMessagesLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useMessages(discussionId || "");

	const createMessage = useCreateMessage();

	const discussion = discussionData?.discussion;
	const otherMember = discussion?.members.find((m) => m.userId !== me?.id)?.user;
	const displayName =
		discussion?.type === "GROUP"
			? discussion.name || "Group"
			: otherMember?.fullName || "Chat";

	const messages = messagesData?.pages.flatMap((page) => page.messages) ?? [];

	const handleSend = async () => {
		const content = inputText.trim();
		if (!content || !discussionId || createMessage.isPending) return;

		try {
			await createMessage.mutateAsync({
				discussionId,
				content,
			});
			setInputText("");
		} catch (err) {
			console.error("Failed to send message", err);
		}
	};

	const renderMessageItem = ({ item }: { item: Message }) => {
		const isMine = item.senderId === me?.id;

		return (
			<View
				className={`my-1.5 flex-row px-4 ${
					isMine ? "justify-end" : "justify-start"
				}`}
			>
				{!isMine && (
					<View className="mr-2 self-end">
						<UserAvatar user={item.sender} size="sm" />
					</View>
				)}

				<View
					className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
						isMine
							? "bg-primary rounded-br-sm"
							: "bg-[#18181b] border border-[#27272a] rounded-bl-sm"
					}`}
				>
					<Text
						className={`text-sm ${
							isMine ? "text-white" : "text-foreground"
						}`}
					>
						{item.content}
					</Text>
					<Text
						className={`text-[10px] mt-1 self-end ${
							isMine ? "text-white/70" : "text-muted-foreground"
						}`}
					>
						{formatPostCreationDate(item.createdAt)}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-[#09090b]"
		>
			{/* Chat Header */}
			<View className="flex-row items-center border-b border-[#27272a] px-4 py-3 bg-[#09090b]">
				<Pressable
					onPress={() => router.back()}
					className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
				>
					<ArrowLeft size={22} color="#fafafa" />
				</Pressable>

				<Pressable
					onPress={() => {
						if (otherMember) {
							router.push(`/(app)/profile/${otherMember.username}` as any);
						}
					}}
					className="flex-row items-center gap-2.5 ml-2 flex-1"
				>
					<UserAvatar user={otherMember} size="sm" />
					<View className="flex-1">
						<Text className="text-sm font-bold text-foreground" numberOfLines={1}>
							{displayName}
						</Text>
						{otherMember?.username ? (
							<Text className="text-xs text-muted-foreground">
								@{otherMember.username}
							</Text>
						) : null}
					</View>
				</Pressable>
			</View>

			{/* Message List */}
			<FlatList
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={renderMessageItem}
				inverted
				className="flex-1 px-1 py-2"
				ListEmptyComponent={
					isMessagesLoading ? (
						<View className="py-12 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-12 px-6 items-center">
							<Text className="text-sm text-muted-foreground">
								No messages in this chat yet. Send the first message!
							</Text>
						</View>
					)
				}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.4}
				ListFooterComponent={
					isFetchingNextPage ? (
						<View className="py-2 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : null
				}
			/>

			{/* Message Input Bar */}
			<View className="border-t border-[#27272a] bg-[#18181b] px-4 py-3 flex-row items-center gap-3">
				<TextInput
					value={inputText}
					onChangeText={setInputText}
					placeholder="Type a message..."
					placeholderTextColor="#71717a"
					multiline
					className="flex-1 max-h-24 rounded-full border border-[#27272a] bg-[#09090b] px-4 py-2 text-sm text-foreground"
				/>
				<Pressable
					onPress={handleSend}
					disabled={!inputText.trim() || createMessage.isPending}
					className={`h-9 w-9 items-center justify-center rounded-full ${
						inputText.trim() && !createMessage.isPending
							? "bg-primary active:opacity-80"
							: "bg-[#27272a] opacity-50"
					}`}
				>
					{createMessage.isPending ? (
						<ActivityIndicator size="small" color="#ffffff" />
					) : (
						<Send size={16} color="#ffffff" />
					)}
				</Pressable>
			</View>
		</KeyboardAvoidingView>
	);
}
