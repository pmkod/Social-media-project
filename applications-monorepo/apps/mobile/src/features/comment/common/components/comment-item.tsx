import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import { cn } from "@/core/lib/utils";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { formatCommentCreationDate } from "@/features/post/common/post.utils";
import { useLikeComment } from "../../like-comment/use-like-comment";
import { useUnlikeComment } from "../../unlike-comment/use-unlike-comment";
import { DeleteCommentAlertDialog } from "../../delete-comment/delete-comment-alert-dialog";
import type { Comment } from "../comment";

type CommentItemProps = {
	comment: Comment;
};

export function CommentItem({ comment }: CommentItemProps) {
	const router = useRouter();
	const { data: authData } = useAuthenticatedUser();
	const authenticatedUser = authData?.user;
	const isAuthor = authenticatedUser?.id === comment.author.id;

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const likeComment = useLikeComment();
	const unlikeComment = useUnlikeComment();

	const isLiked = comment.isLikedByAuthenticatedUser ?? false;
	const likesCount = comment.likesCount ?? 0;

	if (comment.isDeleted) {
		return (
			<View className="py-3 px-4 border-b border-[#27272a] bg-[#09090b]/40">
				<Text className="text-xs italic text-muted-foreground">
					[This comment has been deleted]
				</Text>
			</View>
		);
	}

	const handleLikeToggle = () => {
		if (isLiked) {
			unlikeComment.mutate(comment.id);
		} else {
			likeComment.mutate(comment.id);
		}
	};

	return (
		<View className="flex-row items-start gap-3 py-3.5 px-4 border-b border-[#27272a]/60 bg-[#09090b]">
			<Pressable
				onPress={() =>
					router.push(`/(app)/profile/${comment.author.username}` as any)
				}
			>
				<UserAvatar user={comment.author} size="sm" />
			</Pressable>

			<View className="flex-1">
				<View className="flex-row items-center justify-between">
					<Pressable
						onPress={() =>
							router.push(`/(app)/profile/${comment.author.username}` as any)
						}
						className="flex-row items-center gap-1.5"
					>
						<Text className="text-xs font-semibold text-foreground">
							{comment.author.fullName}
						</Text>
						<Text className="text-[11px] text-muted-foreground">
							@{comment.author.username} · {formatCommentCreationDate(comment.createdAt)}
						</Text>
					</Pressable>

					{isAuthor && (
						<Pressable
							onPress={() => setIsDeleteDialogOpen(true)}
							className="p-1 -mr-1 rounded-full active:bg-[#27272a]"
						>
							<Trash2 size={14} color="#71717a" />
						</Pressable>
					)}
				</View>

				<Text className="mt-1 text-sm text-foreground leading-relaxed">
					{comment.content}
				</Text>

				<View className="mt-2 flex-row items-center gap-4">
					<Pressable
						onPress={handleLikeToggle}
						className="flex-row items-center gap-1 active:opacity-70"
					>
						<Heart
							size={14}
							color={isLiked ? "#bc243c" : "#71717a"}
							fill={isLiked ? "#bc243c" : "transparent"}
						/>
						<Text
							className={cn(
								"text-[11px]",
								isLiked ? "text-primary font-medium" : "text-muted-foreground",
							)}
						>
							{likesCount > 0 ? likesCount : ""}
						</Text>
					</Pressable>
				</View>
			</View>

			<DeleteCommentAlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				comment={comment}
			/>
		</View>
	);
}
