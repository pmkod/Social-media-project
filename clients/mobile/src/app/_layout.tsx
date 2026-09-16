import "@/global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";

import { NAV_THEME } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const { colorScheme } = useColorScheme();

	useEffect(() => {
		void SplashScreen.hideAsync();
	}, []);

	return (
		<ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: "transparent" },
				}}
			>
				<Stack.Screen name="index" />
			</Stack>
			<PortalHost />
		</ThemeProvider>
	);
}
