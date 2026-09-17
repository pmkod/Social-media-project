import * as React from "react";
import { Text, View } from "react-native";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user";

export default function HomeScreen() {
	const authenticatedUserQuery = useAuthenticatedUser();
	const user = authenticatedUserQuery.data?.user;

	return (
		<View className="flex-1 items-center justify-center bg-background p-6">
			<Text className="text-3xl font-bold tracking-tight text-foreground">
				Home
			</Text>
			{user ? (
				<Text className="text-sm text-muted-foreground mt-2">
					Welcome back, {user.fullName || user.username}!
				</Text>
			) : null}
		</View>
	);
}
