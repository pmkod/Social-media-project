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

export const Route = createFileRoute("/_main/settings/theme")({
	component: ThemeSettingsPage,
});

function ThemeSettingsPage() {
	const { theme, setTheme, mounted } = useTheme();
	const themes = [
		{ id: "light", label: "Light", icon: RiSunLine },
		{ id: "dark", label: "Dark", icon: RiMoonLine },
		{ id: "system", label: "System", icon: RiComputerLine },
	] as const;

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings" />
					<AppHeaderTitle>Theme</AppHeaderTitle>
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
								"flex cursor-pointer items-center gap-3 rounded-xl bg-muted/60 px-4 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								isSelected
									? "bg-primary/10 text-primary"
									: " hover:bg-muted/30",
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
