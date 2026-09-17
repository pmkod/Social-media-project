import {
	DarkTheme,
	DefaultTheme,
	type Theme,
} from "expo-router/react-navigation";

export const THEME = {
	light: {
		background: "hsl(0 0% 100%)",
		foreground: "hsl(0 0% 3.9%)",
		card: "hsl(0 0% 100%)",
		popover: "hsl(0 0% 100%)",
		primary: "hsl(0 0% 9%)",
		secondary: "hsl(0 0% 96.1%)",
		muted: "hsl(0 0% 96.1%)",
		accent: "hsl(0 0% 96.1%)",
		destructive: "hsl(0 84.2% 60.2%)",
		border: "hsl(0 0% 89.8%)",
		input: "hsl(0 0% 89.8%)",
		ring: "hsl(0 0% 63%)",
		radius: "0.625rem",
	},
	dark: {
		background: "hsl(0 0% 3.9%)",
		foreground: "hsl(0 0% 98%)",
		card: "hsl(0 0% 3.9%)",
		popover: "hsl(0 0% 3.9%)",
		primary: "hsl(0 0% 98%)",
		secondary: "hsl(0 0% 14.9%)",
		muted: "hsl(0 0% 14.9%)",
		accent: "hsl(0 0% 14.9%)",
		destructive: "hsl(0 70.9% 59.4%)",
		border: "hsl(0 0% 14.9%)",
		input: "hsl(0 0% 14.9%)",
		ring: "hsl(300 0% 45%)",
		radius: "0.625rem",
	},
};

export const NAV_THEME: Record<"light" | "dark", Theme> = {
	light: {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			background: THEME.light.background,
			border: THEME.light.border,
			card: THEME.light.card,
			notification: THEME.light.destructive,
			primary: THEME.light.primary,
			text: THEME.light.foreground,
		},
	},
	dark: {
		...DarkTheme,
		colors: {
			...DarkTheme.colors,
			background: THEME.dark.background,
			border: THEME.dark.border,
			card: THEME.dark.card,
			notification: THEME.dark.destructive,
			primary: THEME.dark.primary,
			text: THEME.dark.foreground,
		},
	},
};
