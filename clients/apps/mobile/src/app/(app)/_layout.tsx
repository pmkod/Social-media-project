import * as React from "react";
import { Tabs, router } from "expo-router";
import { Home, Search, LogOut } from "lucide-react-native";
import { Pressable } from "react-native";
import { useLogout } from "@/features/authentication/logout/use-logout";

export default function AppLayout() {
	const logout = useLogout();

	const handleLogout = async () => {
		await logout.mutateAsync();
		router.replace("/");
	};

	return (
		<Tabs
			screenOptions={{
				headerStyle: {
					backgroundColor: "#09090b",
				},
				headerTintColor: "#fafafa",
				headerShadowVisible: false,
				tabBarStyle: {
					backgroundColor: "#09090b",
					borderTopColor: "#27272a",
					height: 60,
					paddingBottom: 8,
					paddingTop: 8,
				},
				tabBarActiveTintColor: "#bc243c",
				tabBarInactiveTintColor: "#71717a",
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Home size={size ?? 22} color={color} />
					),
					headerRight: () => (
						<Pressable
							onPress={handleLogout}
							hitSlop={8}
							className="mr-4 p-1 active:opacity-60"
						>
							<LogOut size={20} color="#a1a1aa" />
						</Pressable>
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color, size }) => (
						<Search size={size ?? 22} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
