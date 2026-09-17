import * as React from "react";
import { Text, View } from "react-native";

export default function SearchScreen() {
	return (
		<View className="flex-1 items-center justify-center bg-background p-6">
			<Text className="text-3xl font-bold tracking-tight text-foreground">
				Search
			</Text>
		</View>
	);
}
