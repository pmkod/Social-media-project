import * as React from "react";
import { ActivityIndicator, View } from "react-native";

export function FullPageLoader() {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<ActivityIndicator size="large" color="#bc243c" />
		</View>
	);
}
