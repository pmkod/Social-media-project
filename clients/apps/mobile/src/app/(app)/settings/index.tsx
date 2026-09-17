import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
	ArrowLeft,
	Shield,
	Key,
	Mail,
	Smartphone,
	LogOut,
	ChevronRight,
} from "lucide-react-native";
import { useLogout } from "@/features/authentication/logout/use-logout";
import { BaseAlertDialog } from "@/core/components/ui/alert-dialog";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";

export default function SettingsIndexScreen() {
	const router = useRouter();
	const { data: authData } = useAuthenticatedUser();
	const user = authData?.user;
	const logout = useLogout();

	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

	const menuItems = [
		{
			title: "Active Sessions",
			subtitle: "Manage devices where your account is logged in",
			icon: <Smartphone size={20} color="#bc243c" />,
			route: "/(app)/settings/sessions",
		},
		{
			title: "Change Password",
			subtitle: "Update your account password",
			icon: <Key size={20} color="#bc243c" />,
			route: "/(app)/settings/change-password",
		},
		{
			title: "Change Email",
			subtitle: user?.email || "Update your email address",
			icon: <Mail size={20} color="#bc243c" />,
			route: "/(app)/settings/change-email",
		},
	];

	return (
		<View className="flex-1 bg-[#09090b]">
			<View className="flex-row items-center border-b border-[#27272a] px-4 py-3.5">
				<Pressable
					onPress={() => router.back()}
					className="p-1 -ml-1 rounded-full active:bg-[#18181b]"
				>
					<ArrowLeft size={22} color="#fafafa" />
				</Pressable>
				<Text className="ml-3 text-base font-bold text-foreground">
					Settings
				</Text>
			</View>

			<ScrollView className="flex-1 p-4">
				<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
					Security & Account
				</Text>

				<View className="overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b]">
					{menuItems.map((item, index) => (
						<Pressable
							key={item.title}
							onPress={() => router.push(item.route as any)}
							className={`flex-row items-center justify-between p-4 active:bg-[#27272a]/50 ${
								index < menuItems.length - 1 ? "border-b border-[#27272a]" : ""
							}`}
						>
							<View className="flex-row items-center gap-3.5 flex-1 mr-2">
								<View className="h-10 w-10 items-center justify-center rounded-xl bg-[#27272a]/50 border border-[#27272a]">
									{item.icon}
								</View>
								<View className="flex-1">
									<Text className="text-sm font-semibold text-foreground">
										{item.title}
									</Text>
									<Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
										{item.subtitle}
									</Text>
								</View>
							</View>
							<ChevronRight size={18} color="#71717a" />
						</Pressable>
					))}
				</View>

				<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-3 px-1">
					Session
				</Text>

				<View className="overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b]">
					<Pressable
						onPress={() => setIsLogoutDialogOpen(true)}
						className="flex-row items-center justify-between p-4 active:bg-[#27272a]/50"
					>
						<View className="flex-row items-center gap-3.5">
							<View className="h-10 w-10 items-center justify-center rounded-xl bg-destructive/15 border border-destructive/30">
								<LogOut size={20} color="#bc243c" />
							</View>
							<Text className="text-sm font-semibold text-destructive">
								Log Out
							</Text>
						</View>
						<ChevronRight size={18} color="#71717a" />
					</Pressable>
				</View>
			</ScrollView>

			<BaseAlertDialog
				open={isLogoutDialogOpen}
				onOpenChange={setIsLogoutDialogOpen}
				title="Log out?"
				description="Are you sure you want to log out of your account?"
				confirmText="Log out"
				confirmColorScheme="destructive"
				onConfirm={async () => {
					await logout.mutateAsync();
					router.replace("/(auth)/login" as any);
				}}
			/>
		</View>
	);
}
