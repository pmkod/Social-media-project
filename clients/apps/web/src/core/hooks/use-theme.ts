import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === "undefined") return "system";
		return (localStorage.getItem("theme") as Theme) || "system";
	});

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;

		const applyTheme = (t: Theme) => {
			let isDark = false;
			if (t === "dark") {
				isDark = true;
			} else if (t === "light") {
				isDark = false;
			} else {
				isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			}

			if (isDark) {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
		};

		applyTheme(theme);

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemChange = () => {
			if (theme === "system") {
				applyTheme("system");
			}
		};

		mediaQuery.addEventListener("change", handleSystemChange);
		return () => mediaQuery.removeEventListener("change", handleSystemChange);
	}, [theme, mounted]);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		if (typeof window !== "undefined") {
			localStorage.setItem("theme", newTheme);
		}
	};

	return { theme, setTheme, mounted };
}
