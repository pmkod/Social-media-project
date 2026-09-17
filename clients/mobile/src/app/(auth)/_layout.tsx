import * as React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: "#09090b",
				},
				headerTintColor: "#fafafa",
				headerTitle: "",
				headerShadowVisible: false,
				contentStyle: {
					backgroundColor: "#09090b",
				},
				animation: "slide_from_right",
			}}
		/>
	);
}
