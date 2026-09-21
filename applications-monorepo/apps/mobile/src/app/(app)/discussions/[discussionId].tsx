import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Image as ImageIcon, Send, X } from "lucide-react-native";
import { useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiConfig } from "@/core/configs/api.config";
import {
	createSessionAuthorizationHeader,
	getSessionCredentialsSync,
} from "@/core/utils/session.utils";
import type { Message } from "@/features/discussion/common/discussion";
import {
	MESSAGE_IMAGE_MAX_COUNT,
	MESSAGE_IMAGE_MAX_FILE_SIZE,
	MESSAGE_IMAGE_MIME_TYPES,
} from "@/features/discussion/common/discussion.constants";
import { useCreateMessage } from "@/features/discussion/hooks/use-create-message";
import { useDiscussion } from "@/features/discussion/hooks/use-discussion";
import { useMessages } from "@/features/discussion/hooks/use-messages";
import { formatPostCreationDate } from "@/features/post/common/post.utils";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { UserAvatar } from "@/features/user/common/components/user-avatar";

export default function DiscussionDetailScreen() {
	const router = useRouter();
	const { discussionId } = useLocalSearchParams<{ discussionId: string }>();
	const { data: authData } = useAuthenticatedUser();
	const me = authData?.user;

	const handleBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(app)/home" as any);
		}
	};

	const [inputText, setInputText] = useState("");
	const [selectedImages, setSelectedImages] = useState<
		Array<{ uri: string; name: string; type: string }>
	>([]);
	const [composerError, setComposerError] = useState<string | null>(null);

	const { data: discussionData } = useDiscussion(discussionId || "");
	const {
		data: messagesData,
		isLoading: isMessagesLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useMessages(discussionId || "");

	const createMessage = useCreateMessage();

	const discussion = discussionData?.discussion;
	const otherMember = discussion?.members.find(
		(m) => m.userId !== me?.id,
	)?.user;
	const displayName =
		discussion?.type === "GROUP"
			? discussion.name || "Group"
			: otherMember?.fullName || "Chat";

	const messages = messagesData?.pages.flatMap((page) => page.messages) ?? [];

	const handleSend = async () => {
		const content = inputText.trim();
		if (
			(!content && selectedImages.length === 0) ||
			!discussionId ||
			createMessage.isPending
		)
			return;

		try {
			await createMessage.mutateAsync({
				discussionId,
				content: content || undefined,
				images: selectedImages,
			});
			setInputText("");
			setSelectedImages([]);
			setComposerError(null);
		} catch (err) {
			console.error("Failed to send message", err);
		}
	};

	const handlePickImages = async () => {
		setComposerError(null);

		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsMultipleSelection: true,
				selectionLimit: MESSAGE_IMAGE_MAX_COUNT - selectedImages.length,
				quality: 0.8,
			});
			if (result.canceled) return;

			if (
				result.assets.some(
					(asset) =>
						!MESSAGE_IMAGE_MIME_TYPES.includes(
							(asset.mimeType ||
								"image/jpeg") as (typeof MESSAGE_IMAGE_MIME_TYPES)[number],
						) ||
						asset.fileSize === 0 ||
						(asset.fileSize !== undefined &&
							asset.fileSize > MESSAGE_IMAGE_MAX_FILE_SIZE),
				)
			) {
				setComposerError(
					"Only JPEG, PNG, or WebP images up to 20 MB are supported.",
				);
				return;
			}

			const images = result.assets.map((asset, index) => ({
				uri: asset.uri,
				name:
					asset.fileName ||
					asset.uri.split("/").pop() ||
					`message_${Date.now()}_${index}.jpg`,
				type: asset.mimeType || "image/jpeg",
			}));

			setSelectedImages((current) =>
				[...current, ...images].slice(0, MESSAGE_IMAGE_MAX_COUNT),
			);
		} catch (error) {
			console.error("Failed to select message images", error);
			setComposerError("Unable to select images. Please try again.");
		}
	};

	const getMessageImageSource = (url: string) => {
		const credentials = getSessionCredentialsSync();
		const isProtectedMessageImage = url.startsWith("/chat/get-message-image/");
		return {
			uri: url.startsWith("http")
				? url
				: `${ApiConfig.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`,
			headers:
				isProtectedMessageImage && credentials
					? {
							Authorization: createSessionAuthorizationHeader(credentials),
						}
					: undefined,
		};
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
					{item.media?.map((media) =>
						media.type === "IMAGE" ? (
							<Image
								key={media.id}
								source={getMessageImageSource(media.lowQualityUrl || media.url)}
								style={{ width: 220, height: 180, borderRadius: 12 }}
								contentFit="cover"
								cachePolicy="none"
								accessibilityLabel={media.fileName || "Message image"}
							/>
						) : null,
					)}
					{item.content ? (
						<Text
							className={`text-sm ${
								isMine ? "text-white" : "text-foreground"
							} ${item.media?.length ? "mt-2" : ""}`}
						>
							{item.content}
						</Text>
					) : null}
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
		<SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#09090b]">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-[#09090b]"
			>
				{/* Chat Header */}
				<View className="flex-row items-center border-b border-[#27272a] px-4 py-3 bg-[#09090b]">
					<Pressable
						onPress={handleBack}
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
							<Text
								className="text-sm font-bold text-foreground"
								numberOfLines={1}
							>
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
				<View className="border-t border-[#27272a] bg-[#18181b] px-4 py-3">
					{selectedImages.length > 0 ? (
						<View className="mb-3 flex-row gap-2">
							{selectedImages.map((image, index) => (
								<View
									key={image.uri}
									className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#27272a]"
								>
									<Image
										source={{ uri: image.uri }}
										style={{ width: "100%", height: "100%" }}
										contentFit="cover"
									/>
									<Pressable
										onPress={() =>
											setSelectedImages((current) =>
												current.filter((_, itemIndex) => itemIndex !== index),
											)
										}
										accessibilityRole="button"
										accessibilityLabel="Remove image"
										className="absolute top-1 right-1 h-5 w-5 items-center justify-center rounded-full bg-black/75"
									>
										<X size={12} color="#ffffff" />
									</Pressable>
								</View>
							))}
						</View>
					) : null}
					{composerError ? (
						<Text className="mb-2 text-xs text-destructive">
							{composerError}
						</Text>
					) : null}
					<View className="flex-row items-center gap-3">
						<Pressable
							onPress={handlePickImages}
							disabled={
								selectedImages.length >= MESSAGE_IMAGE_MAX_COUNT ||
								createMessage.isPending
							}
							accessibilityRole="button"
							accessibilityLabel="Attach images"
							className="h-9 w-9 items-center justify-center rounded-full bg-[#27272a] disabled:opacity-50"
						>
							<ImageIcon size={17} color="#bc243c" />
						</Pressable>
						<TextInput
							value={inputText}
							onChangeText={(value) => {
								setInputText(value);
								setComposerError(null);
							}}
							placeholder="Type a message..."
							placeholderTextColor="#71717a"
							multiline
							className="flex-1 max-h-24 rounded-full border border-[#27272a] bg-[#09090b] px-4 py-2 text-sm text-foreground"
						/>
						<Pressable
							onPress={handleSend}
							disabled={
								(!inputText.trim() && selectedImages.length === 0) ||
								createMessage.isPending
							}
							accessibilityRole="button"
							accessibilityLabel="Send message"
							className={`h-9 w-9 items-center justify-center rounded-full ${
								(inputText.trim() || selectedImages.length > 0) &&
								!createMessage.isPending
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
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
