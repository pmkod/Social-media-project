import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	ScrollView,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Image as ImageIcon, X } from "lucide-react-native";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { useCreatePost } from "@/features/post/create-post/use-create-post";

export default function CreatePostScreen() {
	const router = useRouter();
	const { data: authData } = useAuthenticatedUser();
	const user = authData?.user;

	const [text, setText] = useState("");
	const [selectedImages, setSelectedImages] = useState<
		{ uri: string; name: string; type: string }[]
	>([]);
	const [error, setError] = useState<string | null>(null);

	const createPost = useCreatePost();

	const handlePickImages = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsMultipleSelection: true,
				quality: 0.8,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const newImages = result.assets.map((asset, index) => {
					const filename =
						asset.fileName ||
						asset.uri.split("/").pop() ||
						`image_${Date.now()}_${index}.jpg`;
					const mimeType = asset.mimeType || "image/jpeg";
					return {
						uri: asset.uri,
						name: filename,
						type: mimeType,
					};
				});
				setSelectedImages((prev) => [...prev, ...newImages]);
			}
		} catch (err: any) {
			console.error("Image pick error", err);
		}
	};

	const handleRemoveImage = (index: number) => {
		setSelectedImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async () => {
		const trimmedText = text.trim();
		if (!trimmedText && selectedImages.length === 0) {
			setError("Please write something or attach an image.");
			return;
		}

		setError(null);
		try {
			await createPost.mutateAsync({
				text: trimmedText,
				medias: selectedImages,
			});
			router.back();
		} catch (err: any) {
			setError(err?.message || "Failed to create post. Please try again.");
		}
	};

	const canSubmit = (text.trim().length > 0 || selectedImages.length > 0) && !createPost.isPending;

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-[#09090b]"
		>
			{/* Top Navigation Bar */}
			<View className="flex-row items-center justify-between border-b border-[#27272a] px-4 py-3.5">
				<Pressable
					onPress={() => router.back()}
					disabled={createPost.isPending}
					className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
				>
					<ArrowLeft size={22} color="#fafafa" />
				</Pressable>

				<Text className="text-base font-bold text-foreground">Create Post</Text>

				<Pressable
					onPress={handleSubmit}
					disabled={!canSubmit}
					className={`rounded-full px-5 py-2 ${
						canSubmit ? "bg-primary active:opacity-80" : "bg-[#27272a] opacity-50"
					}`}
				>
					{createPost.isPending ? (
						<ActivityIndicator size="small" color="#ffffff" />
					) : (
						<Text className="text-sm font-bold text-white">Post</Text>
					)}
				</Pressable>
			</View>

			<ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
				{/* User Header */}
				<View className="flex-row items-center gap-3 mb-4">
					<UserAvatar user={user} size="default" />
					<View>
						<Text className="font-semibold text-sm text-foreground">
							{user?.fullName}
						</Text>
						<Text className="text-xs text-muted-foreground">
							@{user?.username}
						</Text>
					</View>
				</View>

				{/* Error message */}
				{error ? (
					<View className="mb-4 rounded-xl bg-destructive/15 border border-destructive/30 p-3">
						<Text className="text-xs text-destructive">{error}</Text>
					</View>
				) : null}

				{/* Main Text Input */}
				<TextInput
					value={text}
					onChangeText={(val) => {
						setText(val);
						if (error) setError(null);
					}}
					placeholder="What's happening?"
					placeholderTextColor="#71717a"
					multiline
					autoFocus
					textAlignVertical="top"
					className="min-h-[140px] text-base text-foreground"
				/>

				{/* Image Previews */}
				{selectedImages.length > 0 && (
					<View className="mt-4 flex-row flex-wrap gap-3">
						{selectedImages.map((img, idx) => (
							<View
								key={`${img.uri}-${idx}`}
								className="relative h-28 w-28 overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b]"
							>
								<Image
									source={{ uri: img.uri }}
									style={{ width: "100%", height: "100%" }}
									contentFit="cover"
								/>
								<Pressable
									onPress={() => handleRemoveImage(idx)}
									className="absolute top-1.5 right-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/75 active:bg-black"
								>
									<X size={14} color="#ffffff" />
								</Pressable>
							</View>
						))}
					</View>
				)}
			</ScrollView>

			{/* Bottom Action Bar */}
			<View className="border-t border-[#27272a] bg-[#18181b] px-5 py-3 flex-row items-center justify-between">
				<Pressable
					onPress={handlePickImages}
					disabled={createPost.isPending}
					className="flex-row items-center gap-2 rounded-lg bg-[#27272a]/60 px-3 py-2 active:bg-[#27272a]"
				>
					<ImageIcon size={20} color="#bc243c" />
					<Text className="text-xs font-medium text-foreground">Add photo</Text>
				</Pressable>

				<Text className="text-xs text-muted-foreground">
					{text.length}/500
				</Text>
			</View>
		</KeyboardAvoidingView>
	);
}
