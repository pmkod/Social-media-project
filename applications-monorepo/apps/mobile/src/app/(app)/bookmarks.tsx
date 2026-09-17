import React, { useState } from "react";
import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, FolderPlus } from "lucide-react-native";
import { useBookmarks } from "@/features/bookmark/use-bookmarks";
import { PostItem } from "@/features/post/common/post-item";
import { EmptyBlock } from "@/core/components/ui/empty-block";

export default function BookmarksScreen() {
	const router = useRouter();
	const { collectionId, collectionName } = useLocalSearchParams<{
		collectionId?: string;
		collectionName?: string;
	}>();

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
	} = useBookmarks({ bookmarkCollectionId: collectionId });

	const posts = data?.pages.flatMap((page) => page.posts) ?? [];

	return (
		<SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#09090b]">
			<View className="flex-row items-center justify-between border-b border-[#27272a] px-4 py-3.5">
				<View className="flex-row items-center">
					<Pressable
						onPress={handleBack}
						className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
					>
						<ArrowLeft size={22} color="#fafafa" />
					</Pressable>
					<View className="ml-3">
						<Text className="text-base font-bold text-foreground">
							{collectionName ? collectionName : "Saved Posts"}
						</Text>
						{collectionName ? (
							<Text className="text-xs text-muted-foreground">Collection</Text>
						) : null}
					</View>
				</View>

				{!collectionId && (
					<Pressable
						onPress={() =>
							router.push("/(app)/bookmark-collections" as any)
						}
						className="flex-row items-center gap-1.5 rounded-full border border-[#27272a] bg-[#18181b] px-3 py-1.5 active:bg-[#27272a]"
					>
						<FolderPlus size={15} color="#fafafa" />
						<Text className="text-xs font-semibold text-foreground">
							Collections
						</Text>
					</Pressable>
				)}
			</View>

			<FlatList
				data={posts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<PostItem post={item} onDeleted={() => refetch()} />
				)}
				ListEmptyComponent={
					isLoading ? (
						<View className="py-16 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-16 px-6 items-center">
							<EmptyBlock
								title="No saved posts"
								description="When you save posts to view later, they will show up here."
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
		</SafeAreaView>
	);
}
