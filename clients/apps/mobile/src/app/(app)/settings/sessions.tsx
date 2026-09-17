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
import { ArrowLeft, Smartphone, Laptop, Trash2, LogOut } from "lucide-react-native";
import { useActiveSessions } from "@/features/session/list-active-sessions/use-active-sessions";
import { DisableSessionAlertDialog } from "@/features/session/disable-session/disable-session-alert-dialog";
import { LogoutOtherSessionsAlertDialog } from "@/features/session/logout-other-sessions/logout-other-sessions-alert-dialog";
import { formatPostCreationDate } from "@/features/post/common/post.utils";
import type { Session } from "@/features/session/common/session";

export default function SessionsScreen() {
	const router = useRouter();
	const { data: sessions, isLoading, refetch, isRefetching } = useActiveSessions();

	const [sessionToDisable, setSessionToDisable] = useState<Session | null>(null);
	const [isDisableOpen, setIsDisableOpen] = useState(false);
	const [isLogoutOthersOpen, setIsLogoutOthersOpen] = useState(false);

	const otherSessionsCount = (sessions?.length ?? 0) - 1;

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
						Active Sessions
					</Text>
				</View>

				{otherSessionsCount > 0 && (
					<Pressable
						onPress={() => setIsLogoutOthersOpen(true)}
						className="flex-row items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/15 px-3 py-1.5 active:bg-destructive/25"
					>
						<LogOut size={14} color="#bc243c" />
						<Text className="text-xs font-semibold text-destructive">
							Log Out Others
						</Text>
					</Pressable>
				)}
			</View>

			<FlatList
				data={sessions}
				keyExtractor={(item) => item.id}
				renderItem={({ item, index }) => {
					const isMobile =
						item.userAgent?.toLowerCase().includes("mobile") ||
						item.userAgent?.toLowerCase().includes("android") ||
						item.userAgent?.toLowerCase().includes("iphone");

					return (
						<View className="flex-row items-center justify-between border-b border-[#27272a]/60 px-4 py-4">
							<View className="flex-row items-center gap-3.5 flex-1 mr-3">
								<View className="h-10 w-10 items-center justify-center rounded-xl bg-[#18181b] border border-[#27272a]">
									{isMobile ? (
										<Smartphone size={20} color="#bc243c" />
									) : (
										<Laptop size={20} color="#bc243c" />
									)}
								</View>
								<View className="flex-1">
									<View className="flex-row items-center gap-2">
										<Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
											{item.userAgent || "Unknown Device"}
										</Text>
										{index === 0 && (
											<View className="rounded bg-primary/20 px-1.5 py-0.5 border border-primary/30">
												<Text className="text-[10px] font-bold text-primary">
													THIS DEVICE
												</Text>
											</View>
										)}
									</View>
									<Text className="text-xs text-muted-foreground mt-0.5">
										{item.ipAddress || "Unknown IP"} · Active since {formatPostCreationDate(item.createdAt)}
									</Text>
								</View>
							</View>

							{index !== 0 && (
								<Pressable
									onPress={() => {
										setSessionToDisable(item);
										setIsDisableOpen(true);
									}}
									className="p-2 -mr-2 rounded-full active:bg-[#27272a]"
								>
									<Trash2 size={16} color="#71717a" />
								</Pressable>
							)}
						</View>
					);
				}}
				ListEmptyComponent={
					isLoading ? (
						<View className="py-16 items-center">
							<ActivityIndicator size="small" color="#bc243c" />
						</View>
					) : null
				}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={refetch}
						tintColor="#bc243c"
						colors={["#bc243c"]}
					/>
				}
			/>

			{sessionToDisable && (
				<DisableSessionAlertDialog
					open={isDisableOpen}
					onOpenChange={setIsDisableOpen}
					session={sessionToDisable}
					onDisabled={() => {
						setSessionToDisable(null);
						refetch();
					}}
				/>
			)}

			<LogoutOtherSessionsAlertDialog
				open={isLogoutOthersOpen}
				onOpenChange={setIsLogoutOthersOpen}
				onSuccess={() => refetch()}
			/>
		</View>
	);
}
