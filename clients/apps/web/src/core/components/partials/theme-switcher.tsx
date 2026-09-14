import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react";
import { Button } from "@/core/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/core/components/ui/select";
import { type Theme, useTheme } from "@/core/hooks/use-theme";
import * as m from "@/paraglide/messages.js";

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
				aria-label={m.theme_toggle()}
				className={className}
			>
				{isDark ? (
					<RiMoonLine className="size-4 text-foreground" />
				) : (
					<RiSunLine className="size-4 text-foreground" />
				)}
			</Button>
		);
	}

	return (
		<Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
			<SelectTrigger
				size="sm"
				className={`cursor-pointer border-border bg-background transition-colors hover:bg-accent ${className}`}
			>
				<SelectValue placeholder={m.settings_theme()} />
			</SelectTrigger>
			<SelectContent align="end">
				<SelectItem value="light">
					<RiSunLine className="size-4" />
					<span>{m.theme_light()}</span>
				</SelectItem>
				<SelectItem value="dark">
					<RiMoonLine className="size-4" />
					<span>{m.theme_dark()}</span>
				</SelectItem>
				<SelectItem value="system">
					<RiComputerLine className="size-4" />
					<span>{m.theme_system()}</span>
				</SelectItem>
			</SelectContent>
		</Select>
	);
}
