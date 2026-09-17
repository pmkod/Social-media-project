import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	Pressable,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import { Search as SearchIcon, X, Clock, Trash2 } from "lucide-react-native";
import { cn } from "@/core/lib/utils";
import { useSearchUsers } from "@/features/user/search/use-search-users";
import { useFollowSuggestions } from "@/features/user/follow-suggestions/use-follow-suggestions";
import { useSearchPosts } from "@/features/post/search/use-search-posts";
import { useSearchHistory } from "@/features/search/use-search-history";
import { useCreateSearchHistory } from "@/features/search/use-create-search-history";
import { useDeleteSearchHistoryItem } from "@/features/search/use-delete-search-history-item";
import { useClearSearchHistory } from "@/features/search/use-clear-search-history";
import { UserRowItem } from "@/features/user/common/components/user-row-item";
import { PostItem } from "@/features/post/common/post-item";
import { EmptyBlock } from "@/core/components/ui/empty-block";

export default function SearchScreen() {
	const [query, setQuery] = useState("");
	const [activeTab, setActiveTab] = useState<"users" | "posts">("users");

	const trimmedQuery = query.trim();
	const hasQuery = trimmedQuery.length > 0;

	const { data: historyData } = useSearchHistory(15);
	const createHistory = useCreateSearchHistory();
	const deleteHistoryItem = useDeleteSearchHistoryItem();
	const clearHistory = useClearSearchHistory();

	const searchUsers = useSearchUsers({ query: trimmedQuery, enabled: hasQuery });
	const followSuggestions = useFollowSuggestions({ enabled: !hasQuery });
	const searchPosts = useSearchPosts({ query: trimmedQuery, enabled: hasQuery && activeTab === "posts" });

	const historyItems = historyData?.pages.flatMap((page) => page.history) ?? [];
	const users = hasQuery
		? searchUsers.data?.pages.flatMap((page) => page.users) ?? []
		: followSuggestions.data?.pages.flatMap((page) => page.users) ?? [];
	const posts = searchPosts.data?.pages.flatMap((page) => page.posts) ?? [];

	const handleSearchSubmit = () => {
		if (trimmedQuery) {
			createHistory.mutate({ text: trimmedQuery });
		}
	};

	const handleSelectHistory = (text: string) => {
		setQuery(text);
	};

	return (
		<View className="flex-1 bg-[#09090b]">
			{/* Search Header Input */}
			<View className="border-b border-[#27272a] bg-[#09090b] px-4 py-3">
				<View className="flex-row items-center rounded-full border border-[#27272a] bg-[#18181b] px-3.5 py-2">
					<SearchIcon size={18} color="#71717a" />
					<TextInput
						value={query}
						onChangeText={setQuery}
						onSubmitEditing={handleSearchSubmit}
						placeholder="Search people, posts..."
						placeholderTextColor="#71717a"
						returnKeyType="search"
						className="flex-1 ml-2.5 text-sm text-foreground"
					/>
					{query.length > 0 && (
						<Pressable onPress={() => setQuery("")} className="p-1">
							<X size={16} color="#71717a" />
						</Pressable>
					)}
				</View>
			</View>

			{/* When searching: Tab switcher (People / Posts) */}
			{hasQuery ? (
				<View className="flex-row border-b border-[#27272a] bg-[#09090b]">
					<Pressable
						onPress={() => setActiveTab("users")}
						className={cn(
							"flex-1 py-3 items-center border-b-2",
							activeTab === "users" ? "border-primary" : "border-transparent",
						)}
					>
						<Text
							className={cn(
								"text-sm font-semibold",
								activeTab === "users" ? "text-foreground" : "text-muted-foreground",
							)}
						>
							People
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setActiveTab("posts")}
						className={cn(
							"flex-1 py-3 items-center border-b-2",
							activeTab === "posts" ? "border-primary" : "border-transparent",
						)}
					>
						<Text
							className={cn(
								"text-sm font-semibold",
								activeTab === "posts" ? "text-foreground" : "text-muted-foreground",
							)}
						>
							Posts
						</Text>
					</Pressable>
				</View>
			) : null}

			{/* Results or Discovery / History */}
			{hasQuery ? (
				activeTab === "users" ? (
					<FlatList
						data={users}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <UserRowItem user={item} />}
						ListEmptyComponent={
							searchUsers.isLoading ? (
								<View className="py-12 items-center">
									<ActivityIndicator size="small" color="#bc243c" />
								</View>
							) : (
								<View className="py-12 px-6 items-center">
									<EmptyBlock
										title="No people found"
										description={`No accounts matching "${trimmedQuery}".`}
									/>
								</View>
							)
						}
					/>
				) : (
					<FlatList
						data={posts}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <PostItem post={item} />}
						ListEmptyComponent={
							searchPosts.isLoading ? (
								<View className="py-12 items-center">
									<ActivityIndicator size="small" color="#bc243c" />
								</View>
							) : (
								<View className="py-12 px-6 items-center">
									<EmptyBlock
										title="No posts found"
										description={`No posts matching "${trimmedQuery}".`}
									/>
								</View>
							)
						}
					/>
				)
			) : (
				<ScrollView className="flex-1">
					{/* Search History Section */}
					{historyItems.length > 0 && (
						<View className="border-b border-[#27272a] p-4">
							<View className="flex-row items-center justify-between mb-3">
								<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Recent Searches
								</Text>
								<Pressable
									onPress={() => clearHistory.mutate()}
									className="p-1 active:opacity-70"
								>
									<Text className="text-xs font-medium text-primary">
										Clear all
									</Text>
								</Pressable>
							</View>
							<View className="flex-row flex-wrap gap-2">
								{historyItems.map((item) => {
									const label = item.text || item.searchedUser?.fullName || "";
									if (!label) return null;
									return (
										<View
											key={item.id}
											className="flex-row items-center gap-1.5 rounded-full border border-[#27272a] bg-[#18181b] px-3 py-1.5"
										>
											<Clock size={12} color="#71717a" />
											<Pressable onPress={() => handleSelectHistory(label)}>
												<Text className="text-xs text-foreground font-medium">
													{label}
												</Text>
											</Pressable>
											<Pressable
												onPress={() => deleteHistoryItem.mutate(item.id)}
												className="ml-1 -mr-1 p-0.5"
											>
												<X size={12} color="#71717a" />
											</Pressable>
										</View>
									);
								})}
							</View>
						</View>
					)}

					{/* Suggested Accounts Section */}
					<View className="py-3">
						<View className="px-4 py-2">
							<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Suggested for You
							</Text>
						</View>
						{followSuggestions.isLoading ? (
							<View className="py-8 items-center">
								<ActivityIndicator size="small" color="#bc243c" />
							</View>
						) : (
							users.map((item) => <UserRowItem key={item.id} user={item} />)
						)}
					</View>
				</ScrollView>
			)}
		</View>
	);
}
