import {
	type RemixiconComponentType,
	RiArrowRightSLine,
	RiFileShieldLine,
	RiPaletteLine,
	RiShieldKeyholeLine,
	RiTranslate2,
	RiUserSettingsLine,
} from "@remixicon/react";
import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { cn } from "@/core/lib/utils.ts";
import type { SettingsPath } from "@/features/settings/settings-page.tsx";

export const Route = createFileRoute("/_main/settings")({
	component: SettingsLayout,
});

type SettingsSection = {
	id: "account" | "security" | "privacy" | "theme" | "language";
	label: string;
	description: string;
	path: Exclude<SettingsPath, "/settings">;
	icon: RemixiconComponentType;
};

const settingsSections: SettingsSection[] = [
	{
		id: "account",
		label: "Account",
		description: "Manage your email address",
		path: "/settings/account",
		icon: RiUserSettingsLine,
	},
	{
		id: "security",
		label: "Security",
		description: "Keep your account secure",
		path: "/settings/security",
		icon: RiShieldKeyholeLine,
	},
	{
		id: "privacy",
		label: "Privacy and safety",
		description: "Review privacy and terms",
		path: "/settings/privacy",
		icon: RiFileShieldLine,
	},
	{
		id: "theme",
		label: "Theme",
		description: "Choose how Goodspace looks",
		path: "/settings/theme",
		icon: RiPaletteLine,
	},
	{
		id: "language",
		label: "Language",
		description: "Choose your display language",
		path: "/settings/language",
		icon: RiTranslate2,
	},
];

function SettingsLayout() {
	const location = useLocation();
	const isOverview =
		location.pathname === "/settings" || location.pathname === "/settings/";

	return (
		<main className="min-h-screen min-w-0 flex-1 bg-background">
			<div className="lg:grid lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-10">
				<section
					className={`h-screen ${!isOverview ? "hidden lg:block " : ""}`}
				>
					<AppHeader>
						<AppHeaderLeftPart>
							<AppHeaderTitle>Settings</AppHeaderTitle>
						</AppHeaderLeftPart>
					</AppHeader>

					<nav className="space-y-1" aria-label="Settings sections">
						{settingsSections.map((section) => {
							const Icon = section.icon;
							const isSelected =
								location.pathname === section.path ||
								location.pathname.startsWith(`${section.path}/`);
							return (
								<Link
									to={section.path}
									key={section.id}
									className={cn(
										"group flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										isSelected
											? "bg-muted/30 text-white"
											: "hover:bg-muted/30 ",
									)}
								>
									<Icon className="size-5 shrink-0" />
									<span className="min-w-0 flex-1">
										<span className="block font-medium">{section.label}</span>
										<span
											className={cn(
												"mt-0.5 block truncate text-xs text-muted-foreground",
											)}
										>
											{section.description}
										</span>
									</span>
									<RiArrowRightSLine className="size-5 shrink-0 opacity-60" />
								</Link>
							);
						})}
					</nav>
				</section>

				<section className={cn("min-w-0", isOverview && "hidden lg:block")}>
					<Outlet />
				</section>
			</div>
		</main>
	);
}
