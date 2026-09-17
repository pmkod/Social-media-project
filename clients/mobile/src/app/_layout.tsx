import "../global.css";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { NAV_THEME } from "@/core/lib/theme";
import { loadSessionCredentials } from "@/core/utils/session.utils";
import { colorScheme } from "nativewind";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

export default function RootLayout() {
	React.useEffect(() => {
		loadSessionCredentials();
		colorScheme.set("dark");
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={NAV_THEME.dark}>
				<StatusBar style="light" />
				<Stack
					screenOptions={{
						headerShown: false,
						contentStyle: { backgroundColor: "#09090b" },
						animation: "slide_from_right",
					}}
				/>
				<PortalHost />
			</ThemeProvider>
		</QueryClientProvider>
	);
}
