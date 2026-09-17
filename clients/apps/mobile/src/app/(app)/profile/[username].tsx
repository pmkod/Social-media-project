import React, { useState } from "react";
import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
	RefreshControl,
	Modal,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ArrowLeft,
	Calendar,
	MoreHorizontal,
	ShieldAlert,
	Flag,
	Edit3,
} from "lucide-react-native";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile";
import { useUserPosts } from "@/features/post/user-posts/use-user-posts";
import { useUserLikedPosts } from "@/features/post/user-liked-posts/use-user-liked-posts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { useFollowUser } from "@/features/user/follow-user/use-follow-user";
import { useUnfollowUser } from "@/features/user/unfollow-user/use-unfollow-user";
import { BlockUserAlertDialog } from "@/features/user/block-user/block-user-alert-dialog";
import { UnblockUserAlertDialog } from "@/features/user/unblock-user/unblock-user-alert-dialog";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { PostItem } from "@/features/post/common/post-item";
import { EmptyBlock } from "@/core/components/ui/empty-block";
import { ExceptionBlock } from "@/core/components/ui/exception-block";
import { buildImageUrl } from "@/features/post/post-media.functions";

export default function UserProfileScreen() {
	const router = useRouter();
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data: authData } = useAuthenticatedUser();
	const authenticatedUser = authData?.user;

	const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
	const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);

	const {
		data: profileData,
		isLoading: isProfileLoading,
		isError: isProfileError,
		error: profileError,
		refetch: refetchProfile,
	} = useUserProfile({ username: username || "" });

	const user = profileData?.user;
	const isMe = authenticatedUser?.id === user?.id;

	const followUser = useFollowUser();
	const unfollowUser = useUnfollowUser();

	const userPostsQuery = useUserPosts({
		userId: user?.id || "",
	});

	const userLikesQuery = useUserLikedPosts({
		userId: user?.id || "",
	});

	const activeQuery = activeTab === "posts" ? userPostsQuery : userLikesQuery;
	const posts = activeQuery.data?.pages.flatMap((page) => page.posts) ?? [];

	const isFollowed = user?.isFollowedByAuthenticatedUser ?? false;
	const isBlocked = user?.isBlockedByAuthenticatedUser ?? false;
	const isFollowPending = followUser.isPending || unfollowUser.isPending;

	const handleFollowToggle = () => {
		if (!user || isFollowPending) return;
		if (isFollowed) {
			unfollowUser.mutate({ userId: user.id });
		} else {
			followUser.mutate({ userId: user.id });
		}
	};

	if (isProfileLoading && !user) {
		return (
			<View className="flex-1 items-center justify-center bg-[#09090b]">
				<ActivityIndicator size="large" color="#bc243c" />
			</View>
		);
	}

	if (isProfileError || !user) {
		return (
			<View className="flex-1 bg-[#09090b]">
				<View className="flex-row items-center border-b border-[#27272a] px-4 py-3.5">
					<Pressable
						onPress={() => router.back()}
						className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
					>
						<ArrowLeft size={22} color="#fafafa" />
					</Pressable>
					<Text className="ml-3 text-base font-bold text-foreground">Profile</Text>
				</View>
				<View className="flex-1 items-center justify-center px-4">
					<ExceptionBlock
						title="User not found"
						description={(profileError as Error)?.message || "This user does not exist."}
						onRefresh={refetchProfile}
					/>
				</View>
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
						{isMe ? (
							<Pressable
								onPress={() => router.push("/(app)/edit-profile" as any)}
								className="flex-row items-center gap-2 rounded-full border border-[#3f3f46] px-4 py-2 active:bg-[#18181b]"
							>
								<Edit3 size={15} color="#fafafa" />
								<Text className="text-xs font-semibold text-foreground">
									Edit Profile
								</Text>
							</Pressable>
						) : (
							<>
								<Pressable
									onPress={() => setIsMenuOpen(true)}
									className="p-2 rounded-full border border-[#27272a] bg-[#18181b] active:bg-[#27272a]"
								>
									<MoreHorizontal size={18} color="#fafafa" />
								</Pressable>

								{isBlocked ? (
									<Pressable
										onPress={() => setIsUnblockDialogOpen(true)}
										className="rounded-full border border-destructive bg-destructive/15 px-4 py-2"
									>
										<Text className="text-xs font-semibold text-destructive">
											Blocked
										</Text>
									</Pressable>
								) : (
									<Pressable
										onPress={handleFollowToggle}
										disabled={isFollowPending}
										className={`rounded-full px-5 py-2 ${
											isFollowed
												? "border border-[#3f3f46] bg-transparent"
												: "bg-primary"
										}`}
									>
										<Text
											className={`text-xs font-semibold ${
												isFollowed ? "text-foreground" : "text-white"
											}`}
										>
											{isFollowed ? "Following" : "Follow"}
										</Text>
									</Pressable>
								)}
							</>
						)}
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
						Posts
					</Text>
				</Pressable>

				{isMe && (
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
							Likes
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);

	return (
		<View className="flex-1 bg-[#09090b]">
			{/* Top Navbar */}
			<View className="flex-row items-center border-b border-[#27272a] px-4 py-3 bg-[#09090b]">
				<Pressable
					onPress={() => router.back()}
					className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
				>
					<ArrowLeft size={22} color="#fafafa" />
				</Pressable>
				<View className="ml-3">
					<Text className="text-base font-bold text-foreground">
						{user.fullName}
					</Text>
					<Text className="text-xs text-muted-foreground">
						{user.postCount ?? 0} posts
					</Text>
				</View>
			</View>

			{/* Feed FlatList */}
			<FlatList
				data={posts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <PostItem post={item} />}
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
										? "No posts yet"
										: "No liked posts"
								}
								description={
									activeTab === "posts"
										? `@${user.username} hasn't posted anything yet.`
										: "Posts liked by this user will appear here."
								}
							/>
						</View>
					)
				}
				refreshControl={
					<RefreshControl
						refreshing={activeQuery.isRefetching}
						onRefresh={() => {
							refetchProfile();
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

			{/* User Options Modal */}
			<Modal
				visible={isMenuOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsMenuOpen(false)}
			>
				<Pressable
					className="flex-1 bg-black/60 justify-end"
					onPress={() => setIsMenuOpen(false)}
				>
					<View className="bg-[#18181b] border-t border-[#27272a] rounded-t-3xl p-5 pb-8 gap-2">
						<View className="w-12 h-1 bg-[#3f3f46] rounded-full self-center mb-3" />

						<Pressable
							onPress={() => {
								setIsMenuOpen(false);
								if (isBlocked) {
									setIsUnblockDialogOpen(true);
								} else {
									setIsBlockDialogOpen(true);
								}
							}}
							className="flex-row items-center gap-3 py-3 px-4 rounded-xl active:bg-[#27272a]"
						>
							<ShieldAlert size={20} color="#bc243c" />
							<Text className="text-base font-medium text-destructive">
								{isBlocked ? "Unblock User" : "Block User"}
							</Text>
						</Pressable>

						<Pressable
							onPress={() => {
								setIsMenuOpen(false);
								router.push({
									pathname: "/(app)/report" as any,
									params: { userId: user.id },
								});
							}}
							className="flex-row items-center gap-3 py-3 px-4 rounded-xl active:bg-[#27272a]"
						>
							<Flag size={20} color="#a1a1aa" />
							<Text className="text-base font-medium text-foreground">
								Report @{user.username}
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setIsMenuOpen(false)}
							className="mt-2 py-3 px-4 rounded-xl bg-[#27272a] items-center"
						>
							<Text className="text-sm font-semibold text-foreground">
								Cancel
							</Text>
						</Pressable>
					</View>
				</Pressable>
			</Modal>

			{/* Block / Unblock Alert Dialogs */}
			<BlockUserAlertDialog
				open={isBlockDialogOpen}
				onOpenChange={setIsBlockDialogOpen}
				user={user}
				onBlocked={() => refetchProfile()}
			/>
			<UnblockUserAlertDialog
				open={isUnblockDialogOpen}
				onOpenChange={setIsUnblockDialogOpen}
				user={user}
				onUnblocked={() => refetchProfile()}
			/>
		</View>
	);
}
