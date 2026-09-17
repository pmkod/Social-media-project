import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react-native";
import { useCreateBookmarkCollection } from "@/features/bookmark/create-bookmark-collection/use-create-bookmark-collection";

const collectionSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Collection name is required.")
		.max(50, "Collection name must be at most 50 characters."),
	description: z.string().max(200, "Description must be at most 200 characters.").optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function NewBookmarkCollectionScreen() {
	const router = useRouter();
	const createCollection = useCreateBookmarkCollection();
	const [error, setError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CollectionFormData>({
		resolver: zodResolver(collectionSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const onSubmit = async (values: CollectionFormData) => {
		setError(null);
		try {
			await createCollection.mutateAsync({
				name: values.name,
				description: values.description || undefined,
			});
			router.back();
		} catch (err: any) {
			setError(err?.message || "Failed to create collection.");
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-[#09090b]"
		>
			<View className="flex-row items-center justify-between border-b border-[#27272a] px-4 py-3.5">
				<Pressable
					onPress={() => router.back()}
					className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
				>
					<ArrowLeft size={22} color="#fafafa" />
				</Pressable>
				<Text className="text-base font-bold text-foreground">
					New Collection
				</Text>
				<Pressable
					onPress={handleSubmit(onSubmit)}
					disabled={createCollection.isPending}
					className="rounded-full bg-primary px-4 py-1.5 active:opacity-80"
				>
					{createCollection.isPending ? (
						<ActivityIndicator size="small" color="#ffffff" />
					) : (
						<Text className="text-xs font-bold text-white">Create</Text>
					)}
				</Pressable>
			</View>

			<View className="p-4 gap-4">
				{error ? (
					<View className="rounded-xl border border-destructive/30 bg-destructive/15 p-3">
						<Text className="text-xs text-destructive">{error}</Text>
					</View>
				) : null}

				<View>
					<Text className="text-xs font-semibold text-foreground mb-1.5">
						Name
					</Text>
					<Controller
						control={control}
						name="name"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								autoFocus
								placeholder="e.g. Design Inspiration, Travel, Food"
								placeholderTextColor="#71717a"
								className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
							/>
						)}
					/>
					{errors.name ? (
						<Text className="text-xs text-destructive mt-1">
							{errors.name.message}
						</Text>
					) : null}
				</View>

				<View>
					<Text className="text-xs font-semibold text-foreground mb-1.5">
						Description (Optional)
					</Text>
					<Controller
						control={control}
						name="description"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								placeholder="What is this collection about?"
								placeholderTextColor="#71717a"
								multiline
								numberOfLines={3}
								textAlignVertical="top"
								className="min-h-[80px] rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-foreground"
							/>
						)}
					/>
					{errors.description ? (
						<Text className="text-xs text-destructive mt-1">
							{errors.description.message}
						</Text>
					) : null}
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}
