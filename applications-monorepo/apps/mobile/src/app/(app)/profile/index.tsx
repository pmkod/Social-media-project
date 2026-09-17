import React, { useState } from "react";
import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
	Settings,
	Calendar,
	Edit3,
	Bookmark,
} from "lucide-react-native";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { useUserPosts } from "@/features/post/user-posts/use-user-posts";
import { useUserLikedPosts } from "@/features/post/user-liked-posts/use-user-liked-posts";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { PostItem } from "@/features/post/common/post-item";
import { EmptyBlock } from "@/core/components/ui/empty-block";
import { buildImageUrl } from "@/features/post/post-media.functions";

export default function MyProfileScreen() {
	const router = useRouter();
	const { data: authData, isLoading, refetch: refetchUser, isRefetching } = useAuthenticatedUser();
	const user = authData?.user;

	const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");

	const userPostsQuery = useUserPosts({
		userId: user?.id || "",
	});

	const userLikesQuery = useUserLikedPosts({
		userId: user?.id || "",
	});

	const activeQuery = activeTab === "posts" ? userPostsQuery : userLikesQuery;
	const posts = activeQuery.data?.pages.flatMap((page) => page.posts) ?? [];

	if (isLoading && !user) {
		return (
			<View className="flex-1 items-center justify-center bg-[#09090b]">
				<ActivityIndicator size="large" color="#bc243c" />
			</View>
		);
	}

	if (!user) {
		return (
			<View className="flex-1 items-center justify-center bg-[#09090b]">
				<Text className="text-muted-foreground">Please log in to view profile.</Text>
			</View>
		);
	}

	const coverUrl = buildImageUrl(
		user.lowQualityCoverPictureFile?.filename ??
			user.bestQualityCoverPictureFile?.filename,
	);

	const joinedDate = user.createdAt
		? new Date(user.createdAt).toLocaleDateString("en-US", {
				month: "long",
				year: "numeric",
			})
		: null;

	const renderHeader = () => (
		<View>
			{/* Cover Photo */}
			<View className="h-36 bg-[#18181b] overflow-hidden">
				{coverUrl ? (
					<Image
						source={{ uri: coverUrl }}
						style={{ width: "100%", height: "100%" }}
						contentFit="cover"
					/>
				) : (
					<View className="flex-1 bg-[#18181b]" />
				)}
			</View>

			{/* Profile Info Bar */}
			<View className="px-4 pb-4 bg-[#09090b]">
				{/* Avatar & Action Button Row */}
				<View className="flex-row items-end justify-between -mt-12">
					<View className="rounded-full border-4 border-[#09090b] bg-[#09090b]">
						<UserAvatar user={user} size="xl" />
					</View>

					<View className="flex-row items-center gap-2 mb-2">
						<Pressable
							onPress={() => router.push("/(app)/bookmarks" as any)}
							className="p-2 rounded-full border border-[#27272a] bg-[#18181b] active:bg-[#27272a]"
						>
							<Bookmark size={18} color="#fafafa" />
						</Pressable>

						<Pressable
							onPress={() => router.push("/(app)/settings" as any)}
							className="p-2 rounded-full border border-[#27272a] bg-[#18181b] active:bg-[#27272a]"
						>
							<Settings size={18} color="#fafafa" />
						</Pressable>

						<Pressable
							onPress={() => router.push("/(app)/edit-profile" as any)}
							className="flex-row items-center gap-2 rounded-full border border-[#3f3f46] bg-[#18181b] px-4 py-2 active:bg-[#27272a]"
						>
							<Edit3 size={15} color="#fafafa" />
							<Text className="text-xs font-semibold text-foreground">
								Edit Profile
							</Text>
						</Pressable>
					</View>
				</View>

				{/* User Names & Bio */}
				<View className="mt-3">
					<Text className="text-xl font-bold text-foreground">{user.fullName}</Text>
					<Text className="text-sm text-muted-foreground">@{user.username}</Text>

					{user.bio ? (
						<Text className="mt-2.5 text-sm text-foreground leading-relaxed">
							{user.bio}
						</Text>
					) : null}

					{joinedDate ? (
						<View className="mt-3 flex-row items-center gap-1.5">
							<Calendar size={14} color="#71717a" />
							<Text className="text-xs text-muted-foreground">
								Joined {joinedDate}
							</Text>
						</View>
					) : null}

					{/* Followers & Following Stats */}
					<View className="mt-4 flex-row items-center gap-6">
						<Pressable
							onPress={() =>
								router.push(
									`/(app)/profile/${user.username}/following` as any,
								)
							}
							className="flex-row items-center gap-1"
						>
							<Text className="text-sm font-bold text-foreground">
								{user.followingCount ?? 0}
							</Text>
							<Text className="text-sm text-muted-foreground">Following</Text>
						</Pressable>

						<Pressable
							onPress={() =>
								router.push(
									`/(app)/profile/${user.username}/followers` as any,
								)
							}
							className="flex-row items-center gap-1"
						>
							<Text className="text-sm font-bold text-foreground">
								{user.followersCount ?? 0}
							</Text>
							<Text className="text-sm text-muted-foreground">Followers</Text>
						</Pressable>

						<View className="flex-row items-center gap-1">
							<Text className="text-sm font-bold text-foreground">
								{user.postCount ?? 0}
							</Text>
							<Text className="text-sm text-muted-foreground">Posts</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Tabs Header */}
			<View className="flex-row border-b border-[#27272a] bg-[#09090b]">
				<Pressable
					onPress={() => setActiveTab("posts")}
					className={`flex-1 py-3 items-center border-b-2 ${
						activeTab === "posts" ? "border-primary" : "border-transparent"
					}`}
				>
					<Text
						className={`text-sm font-semibold ${
							activeTab === "posts" ? "text-foreground" : "text-muted-foreground"
						}`}
					>
						My Posts
					</Text>
				</Pressable>

				<Pressable
					onPress={() => setActiveTab("likes")}
					className={`flex-1 py-3 items-center border-b-2 ${
						activeTab === "likes" ? "border-primary" : "border-transparent"
					}`}
				>
					<Text
						className={`text-sm font-semibold ${
							activeTab === "likes" ? "text-foreground" : "text-muted-foreground"
						}`}
					>
						Liked Posts
					</Text>
				</Pressable>
			</View>
		</View>
	);

	return (
		<SafeAreaView edges={["top"]} className="flex-1 bg-[#09090b]">
			{/* Top Navbar */}
			<View className="flex-row items-center justify-between border-b border-[#27272a] px-4 py-3 bg-[#09090b]">
				<View>
					<Text className="text-base font-bold text-foreground">
						{user.fullName}
					</Text>
					<Text className="text-xs text-muted-foreground">
						{user.postCount ?? 0} posts
					</Text>
				</View>

				<Pressable
					onPress={() => router.push("/(app)/settings" as any)}
					className="p-1 -mr-1"
				>
					<Settings size={20} color="#fafafa" />
				</Pressable>
			</View>

			{/* Feed FlatList */}
			<FlatList
				data={posts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<PostItem post={item} onDeleted={() => activeQuery.refetch()} />
				)}
				ListHeaderComponent={renderHeader}
				ListEmptyComponent={
					activeQuery.isLoading ? (
						<View className="py-12 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-12 px-6 items-center">
							<EmptyBlock
								title={
									activeTab === "posts"
										? "You haven't posted yet"
										: "No liked posts"
								}
								description={
									activeTab === "posts"
										? "Share your first thought or photo with the community!"
										: "Posts you like will be listed here."
								}
							/>
						</View>
					)
				}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching || activeQuery.isRefetching}
						onRefresh={() => {
							refetchUser();
							activeQuery.refetch();
						}}
						tintColor="#bc243c"
						colors={["#bc243c"]}
					/>
				}
				onEndReached={() => {
					if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
						activeQuery.fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.4}
				ListFooterComponent={
					activeQuery.isFetchingNextPage ? (
						<View className="py-4 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : null
				}
			/>
		</SafeAreaView>
	);
}
