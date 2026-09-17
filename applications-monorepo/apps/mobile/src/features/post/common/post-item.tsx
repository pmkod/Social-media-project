import React, { useState } from "react";
import {
	View,
	Text,
	Pressable,
	ScrollView,
	Dimensions,
	Modal,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
	Heart,
	MessageCircle,
	Bookmark,
	MoreHorizontal,
	Trash2,
	Flag,
	X,
} from "lucide-react-native";
import { cn } from "@/core/lib/utils";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { useLikePost } from "../like-post/use-like-post";
import { useUnlikePost } from "../unlike-post/use-unlike-post";
import { useAddBookmark } from "@/features/bookmark/use-add-bookmark";
import { useRemoveBookmark } from "@/features/bookmark/use-remove-bookmark";
import { DeletePostAlertDialog } from "../delete-post/delete-post-alert-dialog";
import { BookmarkCollectionPickerModal } from "@/features/bookmark/common/components/bookmark-collection-picker-modal";
import { buildImageUrl, buildVideoUrl } from "../post-media.functions";
import { formatPostCreationDate } from "./post.utils";
import type { Post } from "./post";

type PostItemProps = {
	post: Post;
	onDeleted?: () => void;
};

const SCREEN_WIDTH = Dimensions.get("window").width;

export function PostItem({ post, onDeleted }: PostItemProps) {
	const router = useRouter();
	const { data: authData } = useAuthenticatedUser();
	const authenticatedUser = authData?.user;
	const isAuthor = authenticatedUser?.id === post.author.id;

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isBookmarkPickerOpen, setIsBookmarkPickerOpen] = useState(false);

	const likePost = useLikePost();
	const unlikePost = useUnlikePost();

	const isLiked = post.isLikedByAuthenticatedUser ?? false;
	const likesCount = post.likesCount ?? 0;
	const commentsCount = post.commentsCount ?? 0;
	const isBookmarked = post.isBookmarkedByAuthenticatedUser ?? false;

	const handleLikeToggle = () => {
		if (isLiked) {
			unlikePost.mutate(post.id);
		} else {
			likePost.mutate(post.id);
		}
	};

	const handleBookmarkToggle = () => {
		setIsBookmarkPickerOpen(true);
	};

	const medias = post.medias || [];

	return (
		<View className="border-b border-[#27272a] bg-[#09090b] px-4 py-4">
			{/* Post Header */}
			<View className="flex-row items-center justify-between">
				<Pressable
					onPress={() => router.push(`/(app)/profile/${post.author.username}` as any)}
					className="flex-row items-center gap-3 flex-1 mr-2"
				>
					<UserAvatar user={post.author} size="default" />
					<View className="flex-1">
						<Text
							className="font-semibold text-foreground text-sm"
							numberOfLines={1}
						>
							{post.author.fullName}
						</Text>
						<Text className="text-xs text-muted-foreground" numberOfLines={1}>
							@{post.author.username} · {formatPostCreationDate(post.createdAt)}
						</Text>
					</View>
				</Pressable>

				<Pressable
					onPress={() => setIsMenuOpen(true)}
					className="p-2 -mr-2 rounded-full active:bg-[#27272a]/50"
				>
					<MoreHorizontal size={18} color="#a1a1aa" />
				</Pressable>
			</View>

			{/* Post Text */}
			{post.text || post.content ? (
				<Pressable
					onPress={() => router.push(`/(app)/posts/${post.id}` as any)}
					className="mt-3"
				>
					<Text className="text-base text-foreground leading-relaxed">
						{post.text || post.content}
					</Text>
				</Pressable>
			) : null}

			{/* Post Medias */}
			{medias.length > 0 && (
				<View className="mt-3">
					{medias.length === 1 ? (
						<Pressable
							onPress={() => router.push(`/(app)/posts/${post.id}` as any)}
							className="overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b]"
						>
							<Image
								source={{
									uri: buildImageUrl(
										medias[0].lowQualityFile?.filename ??
											medias[0].highQualityFile?.filename ??
											medias[0].highQualityFile?.url,
									),
								}}
								style={{ width: "100%", height: 260 }}
								contentFit="cover"
								transition={200}
							/>
						</Pressable>
					) : (
						<ScrollView
							horizontal
							pagingEnabled={false}
							showsHorizontalScrollIndicator={false}
							className="-mx-4 px-4"
						>
							<View className="flex-row gap-2">
								{medias.map((media, idx) => {
									const uri = buildImageUrl(
										media.lowQualityFile?.filename ??
											media.highQualityFile?.filename ??
											media.highQualityFile?.url,
									);
									return (
										<Pressable
											key={media.id || `media-${idx}`}
											onPress={() => router.push(`/(app)/posts/${post.id}` as any)}
											className="overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b]"
											style={{ width: SCREEN_WIDTH * 0.75, height: 240 }}
										>
											<Image
												source={{ uri }}
												style={{ width: "100%", height: "100%" }}
												contentFit="cover"
												transition={200}
											/>
										</Pressable>
									);
								})}
							</View>
						</ScrollView>
					)}
				</View>
			)}

			{/* Post Actions Footer */}
			<View className="mt-3.5 flex-row items-center justify-between pt-1">
				<View className="flex-row items-center gap-6">
					{/* Like Button */}
					<Pressable
						onPress={handleLikeToggle}
						className="flex-row items-center gap-1.5 active:opacity-70"
					>
						<Heart
							size={20}
							color={isLiked ? "#bc243c" : "#a1a1aa"}
							fill={isLiked ? "#bc243c" : "transparent"}
						/>
						<Text
							className={cn(
								"text-xs font-medium",
								isLiked ? "text-primary font-semibold" : "text-muted-foreground",
							)}
						>
							{likesCount > 0 ? likesCount : ""}
						</Text>
					</Pressable>

					{/* Comment Button */}
					<Pressable
						onPress={() => router.push(`/(app)/posts/${post.id}` as any)}
						className="flex-row items-center gap-1.5 active:opacity-70"
					>
						<MessageCircle size={20} color="#a1a1aa" />
						<Text className="text-xs font-medium text-muted-foreground">
							{commentsCount > 0 ? commentsCount : ""}
						</Text>
					</Pressable>
				</View>

				{/* Bookmark Button */}
				<Pressable
					onPress={handleBookmarkToggle}
					className="p-1 active:opacity-70"
				>
					<Bookmark
						size={20}
						color={isBookmarked ? "#f59e0b" : "#a1a1aa"}
						fill={isBookmarked ? "#f59e0b" : "transparent"}
					/>
				</Pressable>
			</View>

			{/* Post Options Menu Bottom Sheet / Modal */}
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

						{isAuthor ? (
							<Pressable
								onPress={() => {
									setIsMenuOpen(false);
									setIsDeleteDialogOpen(true);
								}}
								className="flex-row items-center gap-3 py-3 px-4 rounded-xl active:bg-[#27272a]"
							>
								<Trash2 size={20} color="#bc243c" />
								<Text className="text-base font-medium text-destructive">
									Delete Post
								</Text>
							</Pressable>
						) : (
							<Pressable
								onPress={() => {
									setIsMenuOpen(false);
									router.push({
										pathname: "/(app)/report" as any,
										params: { postId: post.id },
									});
								}}
								className="flex-row items-center gap-3 py-3 px-4 rounded-xl active:bg-[#27272a]"
							>
								<Flag size={20} color="#a1a1aa" />
								<Text className="text-base font-medium text-foreground">
									Report Post
								</Text>
							</Pressable>
						)}

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

			{/* Delete Post Alert Dialog */}
			<DeletePostAlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				post={post}
				onDeleted={onDeleted}
			/>

			{/* Bookmark Collection Picker Modal */}
			<BookmarkCollectionPickerModal
				postId={post.id}
				open={isBookmarkPickerOpen}
				onOpenChange={setIsBookmarkPickerOpen}
			/>
		</View>
	);
}
