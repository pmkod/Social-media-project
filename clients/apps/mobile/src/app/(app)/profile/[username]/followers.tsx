import React from "react";
import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile";
import { useListFollowers } from "@/features/user/list-followers/use-list-followers";
import { UserRowItem } from "@/features/user/common/components/user-row-item";
import { EmptyBlock } from "@/core/components/ui/empty-block";

export default function FollowersScreen() {
	const router = useRouter();
	const { username } = useLocalSearchParams<{ username: string }>();

	const { data: profileData } = useUserProfile({ username: username || "" });
	const user = profileData?.user;

	const {
		data,
		isLoading,
		refetch,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useListFollowers({ userId: user?.id || "" });

	const followers = data?.pages.flatMap((page) => page.users) ?? [];

	return (
		<View className="flex-1 bg-[#09090b]">
			<View className="flex-row items-center border-b border-[#27272a] px-4 py-3.5">
				<Pressable
					onPress={() => router.back()}
					className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
				>
					<ArrowLeft size={22} color="#fafafa" />
				</Pressable>
				<View className="ml-3">
					<Text className="text-base font-bold text-foreground">Followers</Text>
					<Text className="text-xs text-muted-foreground">@{username}</Text>
				</View>
			</View>

			<FlatList
				data={followers}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <UserRowItem user={item} />}
				ListEmptyComponent={
					isLoading ? (
						<View className="py-16 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-16 px-6 items-center">
							<EmptyBlock
								title="No followers yet"
								description={`@${username} doesn't have any followers yet.`}
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
