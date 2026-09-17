import React, { useState } from "react";
import {
	View,
	Text,
	FlatList,
	TextInput,
	Pressable,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { usePost } from "@/features/post/post-detail/use-post";
import { PostItem } from "@/features/post/common/post-item";
import { useComments } from "@/features/comment/comments/use-comments";
import { useCreateComment } from "@/features/comment/create-comment/use-create-comment";
import { CommentItem } from "@/features/comment/common/components/comment-item";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";
import { EmptyBlock } from "@/core/components/ui/empty-block";
import { ExceptionBlock } from "@/core/components/ui/exception-block";

export default function PostDetailScreen() {
	const router = useRouter();
	const { postId } = useLocalSearchParams<{ postId: string }>();
	const { data: authData } = useAuthenticatedUser();
	const user = authData?.user;

	const [commentText, setCommentText] = useState("");

	const handleBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(app)/home" as any);
		}
	};

	const {
		data: postData,
		isLoading: isPostLoading,
		isError: isPostError,
		error: postError,
		refetch: refetchPost,
	} = usePost({ postId: postId || "" });

	const {
		data: commentsData,
		isLoading: isCommentsLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch: refetchComments,
		isRefetching: isCommentsRefetching,
	} = useComments({ postId: postId || "" });

	const createComment = useCreateComment();

	const post = postData?.post;
	const comments = commentsData?.pages.flatMap((page) => page.data) ?? [];

	const handleSendComment = async () => {
		const content = commentText.trim();
		if (!content || !postId || createComment.isPending) return;

		try {
			await createComment.mutateAsync({
				postId,
				content,
			});
			setCommentText("");
		} catch (err) {
			console.error("Failed to post comment", err);
		}
	};

	if (isPostLoading && !post) {
		return (
			<View className="flex-1 items-center justify-center bg-[#09090b]">
				<ActivityIndicator size="large" color="#bc243c" />
			</View>
		);
	}

	if (isPostError || !post) {
		return (
			<SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#09090b]">
				<View className="flex-row items-center border-b border-[#27272a] px-4 py-3.5">
					<Pressable
						onPress={handleBack}
						className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
					>
						<ArrowLeft size={22} color="#fafafa" />
					</Pressable>
					<Text className="ml-3 text-base font-bold text-foreground">Post</Text>
				</View>
				<View className="flex-1 items-center justify-center px-4">
					<ExceptionBlock
						title="Post not found"
						description={(postError as Error)?.message || "This post may have been deleted."}
						onRefresh={refetchPost}
					/>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#09090b]">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-[#09090b]"
			>
				{/* Top Bar */}
				<View className="flex-row items-center border-b border-[#27272a] px-4 py-3.5">
					<Pressable
						onPress={handleBack}
						className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
					>
						<ArrowLeft size={22} color="#fafafa" />
					</Pressable>
					<Text className="ml-3 text-base font-bold text-foreground">Post</Text>
				</View>

				{/* Post and Comments FlatList */}
				<FlatList
					data={comments}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => <CommentItem comment={item} />}
					ListHeaderComponent={
						<View>
							<PostItem post={post} onDeleted={handleBack} />
						<View className="border-b border-[#27272a] bg-[#18181b]/30 px-4 py-2.5">
							<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Comments ({post.commentsCount ?? comments.length})
							</Text>
						</View>
					</View>
				}
				ListEmptyComponent={
					isCommentsLoading ? (
						<View className="py-12 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-12 px-6 items-center">
							<EmptyBlock
								title="No comments yet"
								description="Be the first one to share what you think!"
							/>
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
						<View className="py-4 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : null
				}
				refreshing={isCommentsRefetching}
				onRefresh={() => {
					refetchPost();
					refetchComments();
				}}
			/>

			{/* Bottom Comment Composer Input */}
			<View className="border-t border-[#27272a] bg-[#18181b] px-4 py-3 flex-row items-center gap-3">
				<UserAvatar user={user} size="sm" />
				<TextInput
					value={commentText}
					onChangeText={setCommentText}
					placeholder="Add a comment..."
					placeholderTextColor="#71717a"
					multiline
					className="flex-1 max-h-24 rounded-full border border-[#27272a] bg-[#09090b] px-4 py-2 text-sm text-foreground"
				/>
				<Pressable
					onPress={handleSendComment}
					disabled={!commentText.trim() || createComment.isPending}
					className={`h-9 w-9 items-center justify-center rounded-full ${
						commentText.trim() && !createComment.isPending
							? "bg-primary active:opacity-80"
							: "bg-[#27272a] opacity-50"
					}`}
				>
					{createComment.isPending ? (
						<ActivityIndicator size="small" color="#ffffff" />
					) : (
						<Send size={16} color="#ffffff" />
					)}
				</Pressable>
			</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
