import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { useTheme } from "@/core/hooks/use-theme.ts";
import { cn } from "@/core/lib/utils.ts";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/settings/theme")({
	component: ThemeSettingsPage,
});

function ThemeSettingsPage() {
	const { theme, setTheme, mounted } = useTheme();
	const themes = [
		{ id: "light", label: m.theme_light(), icon: RiSunLine },
		{ id: "dark", label: m.theme_dark(), icon: RiMoonLine },
		{ id: "system", label: m.theme_system(), icon: RiComputerLine },
	] as const;

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings" />
					<AppHeaderTitle>{m.settings_theme()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="grid gap-3 sm:grid-cols-3">
				{themes.map((themeOption) => {
					const Icon = themeOption.icon;
					const isSelected = mounted && theme === themeOption.id;
					return (
						<button
							type="button"
							key={themeOption.id}
							onClick={() => setTheme(themeOption.id)}
							aria-pressed={isSelected}
							className={cn(
								"flex cursor-pointer items-center gap-3 rounded bg-accent px-4 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								isSelected ? "bg-primary/10 text-primary" : " hover:bg-accent",
							)}
						>
							<Icon className="size-5" />
							<span className="font-medium">{themeOption.label}</span>
						</button>
					);
				})}
			</div>
		</>
	);
}
