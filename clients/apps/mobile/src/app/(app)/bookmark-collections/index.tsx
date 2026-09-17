import React, { useState } from "react";
import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus, Folder, Trash2 } from "lucide-react-native";
import { useBookmarkCollections } from "@/features/bookmark/use-bookmark-collections";
import { DeleteBookmarkCollectionAlertDialog } from "@/features/bookmark/delete-bookmark-collection/delete-bookmark-collection-alert-dialog";
import { EmptyBlock } from "@/core/components/ui/empty-block";
import type { BookmarkCollection } from "@/features/bookmark/common/bookmark-collection";

export default function BookmarkCollectionsScreen() {
	const router = useRouter();
	const {
		data,
		isLoading,
		refetch,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useBookmarkCollections({ limit: 20 });

	const [selectedCollection, setSelectedCollection] =
		useState<BookmarkCollection | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const collections =
		data?.pages.flatMap((page) => page.bookmarkCollections) ?? [];

	return (
		<View className="flex-1 bg-[#09090b]">
			<View className="flex-row items-center justify-between border-b border-[#27272a] px-4 py-3.5">
				<View className="flex-row items-center">
					<Pressable
						onPress={() => router.back()}
						className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
					>
						<ArrowLeft size={22} color="#fafafa" />
					</Pressable>
					<Text className="ml-3 text-base font-bold text-foreground">
						Collections
					</Text>
				</View>

				<Pressable
					onPress={() =>
						router.push("/(app)/bookmark-collections/new" as any)
					}
					className="flex-row items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 active:opacity-80"
				>
					<Plus size={15} color="#ffffff" />
					<Text className="text-xs font-semibold text-white">New</Text>
				</Pressable>
			</View>

			<FlatList
				data={collections}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<Pressable
						onPress={() =>
							router.push({
								pathname: "/(app)/bookmarks" as any,
								params: {
									collectionId: item.id,
									collectionName: item.name,
								},
							})
						}
						className="flex-row items-center justify-between border-b border-[#27272a]/60 px-4 py-4 active:bg-[#18181b]"
					>
						<View className="flex-row items-center gap-3.5 flex-1 mr-3">
							<View className="h-11 w-11 items-center justify-center rounded-xl border border-[#27272a] bg-[#18181b]">
								<Folder size={20} color="#bc243c" />
							</View>
							<View className="flex-1">
								<Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
									{item.name}
								</Text>
								<Text className="text-xs text-muted-foreground mt-0.5">
									{item.bookmarksCount ?? 0} saved posts
								</Text>
							</View>
						</View>

						<Pressable
							onPress={() => {
								setSelectedCollection(item);
								setIsDeleteDialogOpen(true);
							}}
							className="p-2 -mr-2 rounded-full active:bg-[#27272a]"
						>
							<Trash2 size={16} color="#71717a" />
						</Pressable>
					</Pressable>
				)}
				ListEmptyComponent={
					isLoading ? (
						<View className="py-16 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-16 px-6 items-center">
							<EmptyBlock
								title="No collections yet"
								description="Group your saved posts into collections to keep them organized."
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

			{selectedCollection && (
				<DeleteBookmarkCollectionAlertDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					collection={selectedCollection}
					onDeleted={() => {
						setSelectedCollection(null);
						refetch();
					}}
				/>
			)}
		</View>
	);
}
