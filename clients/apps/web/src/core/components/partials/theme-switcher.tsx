import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/core/components/ui/select";
import { useTheme, type Theme } from "@/core/hooks/use-theme";

type ThemeSwitcherProps = {
	className?: string;
	variant?: "select" | "toggle";
};

export function ThemeSwitcher({
	className = "",
	variant = "select",
}: ThemeSwitcherProps) {
	const { theme, setTheme, mounted } = useTheme();

	if (!mounted) {
		return (
			<div
				className={`h-9 w-[120px] rounded-md border border-input bg-transparent opacity-50 ${className}`}
			/>
		);
	}

	if (variant === "toggle") {
		const isDark =
			theme === "dark" ||
			(theme === "system" &&
				typeof window !== "undefined" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);

		return (
			<Button
				variant="outline"
				size="icon-sm"
				onClick={() => setTheme(isDark ? "light" : "dark")}
				aria-label="Toggle theme"
				className={className}
			>
				{isDark ? (
					<Moon className="size-4 text-foreground" />
				) : (
					<Sun className="size-4 text-foreground" />
				)}
			</Button>
		);
	}

	return (
		<Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
			<SelectTrigger
				size="sm"
				className={`w-[125px] cursor-pointer border-border bg-background hover:bg-accent transition-colors ${className}`}
			>
				<SelectValue placeholder="Theme" />
			</SelectTrigger>
			<SelectContent align="end">
				<SelectItem value="light">
					<Sun className="size-4" />
					<span>Light</span>
				</SelectItem>
				<SelectItem value="dark">
					<Moon className="size-4" />
					<span>Dark</span>
				</SelectItem>
				<SelectItem value="system">
					<Monitor className="size-4" />
					<span>System</span>
				</SelectItem>
			</SelectContent>
		</Select>
	);
}
