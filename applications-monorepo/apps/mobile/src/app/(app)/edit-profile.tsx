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
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Camera, Check } from "lucide-react-native";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { useUpdateProfile } from "@/features/user/edit-profile/use-update-profile";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { buildImageUrl } from "@/features/post/post-media.functions";

const editProfileSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(1, "Full name is required.")
		.max(64, "Full name must be at most 64 characters."),
	username: z
		.string()
		.trim()
		.min(3, "Username must be at least 3 characters.")
		.max(30, "Username must be at most 30 characters.")
		.regex(
			/^[a-zA-Z0-9_.]+$/,
			"Username can only contain letters, numbers, underscores and periods.",
		),
	bio: z.string().max(200, "Bio must be at most 200 characters.").optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfileScreen() {
	const router = useRouter();
	const { data: authData } = useAuthenticatedUser();
	const user = authData?.user;

	const [profilePicture, setProfilePicture] = useState<any>(null);
	const [coverPicture, setCoverPicture] = useState<any>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const updateProfile = useUpdateProfile();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<EditProfileFormData>({
		resolver: zodResolver(editProfileSchema),
		defaultValues: {
			fullName: user?.fullName || "",
			username: user?.username || "",
			bio: user?.bio || "",
		},
	});

	const handlePickAvatar = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (!result.canceled && result.assets && result.assets[0]) {
				const asset = result.assets[0];
				setProfilePicture({
					uri: asset.uri,
					name: asset.fileName || "avatar.jpg",
					type: asset.mimeType || "image/jpeg",
				});
			}
		} catch (err) {
			console.error("Avatar pick error", err);
		}
	};

	const handlePickCover = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [16, 9],
				quality: 0.8,
			});

			if (!result.canceled && result.assets && result.assets[0]) {
				const asset = result.assets[0];
				setCoverPicture({
					uri: asset.uri,
					name: asset.fileName || "cover.jpg",
					type: asset.mimeType || "image/jpeg",
				});
			}
		} catch (err) {
			console.error("Cover pick error", err);
		}
	};

	const handleBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(app)/home" as any);
		}
	};

	const onSubmit = async (values: EditProfileFormData) => {
		setSubmitError(null);
		try {
			await updateProfile.mutateAsync({
				fullName: values.fullName,
				username: values.username,
				bio: values.bio || "",
				profilePicture,
				coverPicture,
			});
			handleBack();
		} catch (err: any) {
			setSubmitError(err?.message || "Failed to update profile.");
		}
	};

	const currentCoverUrl =
		coverPicture?.uri ||
		buildImageUrl(
			user?.bestQualityCoverPictureFile?.filename ??
				user?.lowQualityCoverPictureFile?.filename,
		);

	return (
		<SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#09090b]">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-[#09090b]"
			>
				{/* Top Navbar */}
				<View className="flex-row items-center justify-between border-b border-[#27272a] px-4 py-3.5">
					<Pressable
						onPress={handleBack}
						className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
					>
						<ArrowLeft size={22} color="#fafafa" />
					</Pressable>
					<Text className="text-base font-bold text-foreground">Edit Profile</Text>
				<Pressable
					onPress={handleSubmit(onSubmit)}
					disabled={updateProfile.isPending}
					className="rounded-full bg-primary px-4 py-1.5 active:opacity-80"
				>
					{updateProfile.isPending ? (
						<ActivityIndicator size="small" color="#ffffff" />
					) : (
						<Text className="text-xs font-bold text-white">Save</Text>
					)}
				</Pressable>
			</View>

			<ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
				{/* Cover Photo Editor */}
				<View className="relative h-36 bg-[#18181b] overflow-hidden">
					{currentCoverUrl ? (
						<Image
							source={{ uri: currentCoverUrl }}
							style={{ width: "100%", height: "100%" }}
							contentFit="cover"
						/>
					) : (
						<View className="flex-1 bg-[#18181b]" />
					)}
					<Pressable
						onPress={handlePickCover}
						className="absolute inset-0 items-center justify-center bg-black/40 active:bg-black/60"
					>
						<View className="rounded-full bg-black/60 p-2.5">
							<Camera size={20} color="#ffffff" />
						</View>
					</Pressable>
				</View>

				{/* Avatar Photo Editor */}
				<View className="px-4 -mt-12 mb-4">
					<View className="relative self-start rounded-full border-4 border-[#09090b]">
						{profilePicture ? (
							<View className="h-20 w-20 rounded-full overflow-hidden">
								<Image
									source={{ uri: profilePicture.uri }}
									style={{ width: "100%", height: "100%" }}
									contentFit="cover"
								/>
							</View>
						) : (
							<UserAvatar user={user} size="xl" />
						)}
						<Pressable
							onPress={handlePickAvatar}
							className="absolute inset-0 items-center justify-center rounded-full bg-black/40 active:bg-black/60"
						>
							<Camera size={20} color="#ffffff" />
						</Pressable>
					</View>
				</View>

				{/* Form Fields */}
				<View className="px-4 gap-4 pb-8">
					{submitError ? (
						<View className="rounded-xl border border-destructive/30 bg-destructive/15 p-3">
							<Text className="text-xs text-destructive">{submitError}</Text>
						</View>
					) : null}

					{/* Full Name */}
					<View>
						<Text className="text-xs font-semibold text-foreground mb-1.5">
							Full Name
						</Text>
						<Controller
							control={control}
							name="fullName"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									placeholder="Your full name"
									placeholderTextColor="#71717a"
									className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
								/>
							)}
						/>
						{errors.fullName ? (
							<Text className="text-xs text-destructive mt-1">
								{errors.fullName.message}
							</Text>
						) : null}
					</View>

					{/* Username */}
					<View>
						<Text className="text-xs font-semibold text-foreground mb-1.5">
							Username
						</Text>
						<Controller
							control={control}
							name="username"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									autoCapitalize="none"
									placeholder="username"
									placeholderTextColor="#71717a"
									className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
								/>
							)}
						/>
						{errors.username ? (
							<Text className="text-xs text-destructive mt-1">
								{errors.username.message}
							</Text>
						) : null}
					</View>

					{/* Bio */}
					<View>
						<Text className="text-xs font-semibold text-foreground mb-1.5">
							Bio
						</Text>
						<Controller
							control={control}
							name="bio"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									placeholder="Tell the world about yourself"
									placeholderTextColor="#71717a"
									multiline
									numberOfLines={3}
									textAlignVertical="top"
									className="min-h-[80px] rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
								/>
							)}
						/>
						{errors.bio ? (
							<Text className="text-xs text-destructive mt-1">
								{errors.bio.message}
							</Text>
						) : null}
					</View>
				</View>
			</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
