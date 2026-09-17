import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	Pressable,
	ActivityIndicator,
	Modal,
} from "react-native";
import { useRouter } from "expo-router";
import {
	Bookmark,
	Check,
	FolderPlus,
	Search,
	X,
	Plus,
} from "lucide-react-native";
import { useBookmarkCollections } from "../../use-bookmark-collections";
import { useAddBookmark } from "../../use-add-bookmark";
import { useRemoveBookmark } from "../../use-remove-bookmark";
import { useCreateBookmarkCollection } from "../../create-bookmark-collection/use-create-bookmark-collection";
import type { BookmarkCollection } from "../bookmark-collection";

export type BookmarkCollectionPickerModalProps = {
	postId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function BookmarkCollectionPickerModal({
	postId,
	open,
	onOpenChange,
}: BookmarkCollectionPickerModalProps) {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreatingInline, setIsCreatingInline] = useState(false);
	const [newCollectionName, setNewCollectionName] = useState("");

	const {
		data,
		isLoading,
		refetch,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useBookmarkCollections({
		postId,
		q: searchQuery.trim() || undefined,
		enabled: open,
	});

	const addBookmark = useAddBookmark();
	const removeBookmark = useRemoveBookmark();
	const createCollection = useCreateBookmarkCollection();

	const collections =
		data?.pages.flatMap((page) => page.bookmarkCollections) ?? [];

	const handleToggleCollection = async (collection: BookmarkCollection) => {
		if (addBookmark.isPending || removeBookmark.isPending) return;

		try {
			if (collection.isPostInCollection) {
				await removeBookmark.mutateAsync({
					postId,
					bookmarkCollectionId: collection.id,
				});
			} else {
				await addBookmark.mutateAsync({
					postId,
					bookmarkCollectionId: collection.id,
				});
			}
		} catch (err) {
			console.error("Failed to toggle bookmark", err);
		}
	};

	const handleCreateCollection = async () => {
		const trimmed = newCollectionName.trim();
		if (!trimmed || createCollection.isPending) return;

		try {
			const res = await createCollection.mutateAsync({
				name: trimmed,
			});
			setNewCollectionName("");
			setIsCreatingInline(false);
			if (res.bookmarkCollection?.id) {
				await addBookmark.mutateAsync({
					postId,
					bookmarkCollectionId: res.bookmarkCollection.id,
				});
			}
		} catch (err) {
			console.error("Failed to create collection", err);
		}
	};

	return (
		<Modal
			visible={open}
			transparent
			animationType="slide"
			onRequestClose={() => onOpenChange(false)}
		>
			<Pressable
				className="flex-1 bg-black/60 justify-end"
				onPress={() => onOpenChange(false)}
			>
				<Pressable
					className="bg-[#18181b] border-t border-[#27272a] rounded-t-3xl max-h-[80%] min-h-[360px]"
					onPress={(e) => e.stopPropagation()}
				>
					{/* Drag Handle */}
					<View className="w-12 h-1 bg-[#3f3f46] rounded-full self-center my-3" />

					{/* Header */}
					<View className="flex-row items-center justify-between px-5 pb-3 border-b border-[#27272a]">
						<View className="flex-row items-center gap-2">
							<Bookmark size={18} color="#f59e0b" fill="#f59e0b" />
							<Text className="text-base font-bold text-foreground">
								Save to collection
							</Text>
						</View>
						<Pressable
							onPress={() => onOpenChange(false)}
							className="p-1 -mr-1 rounded-full active:bg-[#27272a]"
						>
							<X size={20} color="#a1a1aa" />
						</Pressable>
					</View>

					{/* Search & New Collection Bar */}
					<View className="px-4 py-3 border-b border-[#27272a] flex-row items-center gap-2">
						<View className="flex-1 flex-row items-center rounded-xl border border-[#27272a] bg-[#09090b] px-3 py-2">
							<Search size={16} color="#71717a" />
							<TextInput
								value={searchQuery}
								onChangeText={setSearchQuery}
								placeholder="Search collections..."
								placeholderTextColor="#71717a"
								className="flex-1 ml-2 text-xs text-foreground"
							/>
							{searchQuery.length > 0 && (
								<Pressable onPress={() => setSearchQuery("")} className="p-0.5">
									<X size={14} color="#71717a" />
								</Pressable>
							)}
						</View>

						<Pressable
							onPress={() => setIsCreatingInline((prev) => !prev)}
							className="flex-row items-center gap-1 rounded-xl bg-primary px-3 py-2 active:opacity-80"
						>
							<Plus size={16} color="#ffffff" />
							<Text className="text-xs font-semibold text-white">New</Text>
						</Pressable>
					</View>

					{/* Inline Collection Creator */}
					{isCreatingInline && (
						<View className="border-b border-[#27272a] bg-[#09090b] px-4 py-3 flex-row items-center gap-2">
							<TextInput
								value={newCollectionName}
								onChangeText={setNewCollectionName}
								placeholder="Collection name..."
								placeholderTextColor="#71717a"
								autoFocus
								className="flex-1 rounded-xl border border-[#27272a] bg-[#18181b] px-3 py-2 text-xs text-foreground"
							/>
							<Pressable
								onPress={handleCreateCollection}
								disabled={!newCollectionName.trim() || createCollection.isPending}
								className={`rounded-xl px-3.5 py-2 ${
									newCollectionName.trim() && !createCollection.isPending
										? "bg-primary active:opacity-80"
										: "bg-[#27272a] opacity-50"
								}`}
							>
								{createCollection.isPending ? (
									<ActivityIndicator size="small" color="#ffffff" />
								) : (
									<Text className="text-xs font-bold text-white">Save</Text>
								)}
							</Pressable>
						</View>
					)}

					{/* Collections List */}
					<FlatList
						data={collections}
						keyExtractor={(item) => item.id}
						className="flex-1"
						renderItem={({ item }) => {
							const isInCollection = item.isPostInCollection ?? false;

							return (
								<Pressable
									onPress={() => handleToggleCollection(item)}
									className="flex-row items-center justify-between px-5 py-3.5 border-b border-[#27272a]/50 active:bg-[#27272a]/40"
								>
									<View className="flex-1 mr-3">
										<Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
											{item.name}
										</Text>
										<Text className="text-xs text-muted-foreground mt-0.5">
											{item.bookmarksCount} {item.bookmarksCount === 1 ? "post" : "posts"}
										</Text>
									</View>

									<View
										className={`h-6 w-6 rounded-full items-center justify-center border ${
											isInCollection
												? "border-primary bg-primary"
												: "border-[#3f3f46] bg-transparent"
										}`}
									>
										{isInCollection && <Check size={14} color="#ffffff" />}
									</View>
								</Pressable>
							);
						}}
						ListEmptyComponent={
							isLoading ? (
								<View className="py-12 items-center">
									<ActivityIndicator size="small" color="#bc243c" />
								</View>
							) : (
								<View className="py-12 px-6 items-center">
									<FolderPlus size={36} color="#71717a" />
									<Text className="text-sm font-semibold text-foreground mt-3">
										{searchQuery ? "No collections found" : "No collections yet"}
									</Text>
									<Text className="text-xs text-muted-foreground text-center mt-1">
										{searchQuery
											? "Try a different search term or create a new one."
											: "Create your first collection to save this post."}
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
								<View className="py-3 items-center">
									<ActivityIndicator size="small" color="#bc243c" />
								</View>
							) : null
						}
					/>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
