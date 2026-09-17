import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	Pressable,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search as SearchIcon, X } from "lucide-react-native";
import { useSearchUsers } from "@/features/user/search/use-search-users";
import { useFollowSuggestions } from "@/features/user/follow-suggestions/use-follow-suggestions";
import { useCreateDiscussion } from "@/features/discussion/hooks/use-create-discussion";
import { UserAvatar } from "@/features/user/common/components/user-avatar";
import type { User } from "@/features/user/common/user";

export default function NewDiscussionScreen() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const handleBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(app)/home" as any);
		}
	};

	const trimmedQuery = query.trim();
	const hasQuery = trimmedQuery.length > 0;

	const searchUsers = useSearchUsers({ query: trimmedQuery, enabled: hasQuery });
	const suggestions = useFollowSuggestions({ enabled: !hasQuery });

	const users = hasQuery
		? searchUsers.data?.pages.flatMap((page) => page.users) ?? []
		: suggestions.data?.pages.flatMap((page) => page.users) ?? [];

	const createDiscussion = useCreateDiscussion();

	const handleStartChat = async (targetUser: User) => {
		setSelectedUser(targetUser);
		try {
			const res = await createDiscussion.mutateAsync({
				type: "DIRECT",
				memberIds: [targetUser.id],
			});
			router.replace(`/(app)/discussions/${res.discussion.id}` as any);
		} catch (err) {
			console.error("Failed to start discussion", err);
			setSelectedUser(null);
		}
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#09090b]">
			{/* Top Navbar */}
			<View className="flex-row items-center border-b border-[#27272a] px-4 py-3.5">
				<Pressable
					onPress={handleBack}
					className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
				>
					<ArrowLeft size={22} color="#fafafa" />
				</Pressable>
				<Text className="ml-3 text-base font-bold text-foreground">
					New Message
				</Text>
			</View>

			{/* Search Input */}
			<View className="border-b border-[#27272a] px-4 py-3">
				<View className="flex-row items-center rounded-full border border-[#27272a] bg-[#18181b] px-3.5 py-2">
					<SearchIcon size={18} color="#71717a" />
					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search people..."
						placeholderTextColor="#71717a"
						className="flex-1 ml-2.5 text-sm text-foreground"
					/>
					{query.length > 0 && (
						<Pressable onPress={() => setQuery("")} className="p-1">
							<X size={16} color="#71717a" />
						</Pressable>
					)}
				</View>
			</View>

			{/* User List */}
			<FlatList
				data={users}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => {
					const isStartingThis =
						createDiscussion.isPending && selectedUser?.id === item.id;

					return (
						<Pressable
							onPress={() => handleStartChat(item)}
							disabled={createDiscussion.isPending}
							className="flex-row items-center justify-between py-3.5 px-4 border-b border-[#27272a]/50 active:bg-[#18181b]"
						>
							<View className="flex-row items-center gap-3 flex-1 mr-3">
								<UserAvatar user={item} size="default" />
								<View className="flex-1">
									<Text className="font-semibold text-sm text-foreground" numberOfLines={1}>
										{item.fullName}
									</Text>
									<Text className="text-xs text-muted-foreground" numberOfLines={1}>
										@{item.username}
									</Text>
								</View>
							</View>

							{isStartingThis ? (
								<ActivityIndicator size="small" color="#bc243c" />
							) : (
								<View className="rounded-full border border-[#3f3f46] bg-[#18181b] px-3 py-1.5">
									<Text className="text-xs font-semibold text-foreground">
										Chat
									</Text>
								</View>
							)}
						</Pressable>
					);
				}}
				ListEmptyComponent={
					searchUsers.isLoading || suggestions.isLoading ? (
						<View className="py-12 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : (
						<View className="py-12 px-6 items-center">
							<Text className="text-sm text-muted-foreground">
								No users found. Try another search.
							</Text>
						</View>
					)
				}
			/>
		</SafeAreaView>
	);
}
