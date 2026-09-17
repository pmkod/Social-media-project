import {
	type RemixiconComponentType,
	RiFileShieldLine,
	RiPaletteLine,
	RiShieldKeyholeLine,
	RiTranslate2,
	RiUserSettingsLine,
} from "@remixicon/react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { cn } from "@/core/lib/utils.ts";
import {
	SettingRowItem,
	type SettingsPath,
} from "@/features/setting/common/setting-row-item.tsx";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/settings")({
	component: SettingsLayout,
});

type SettingsSection = {
	id: "account" | "security" | "privacy" | "theme" | "language";
	label: string;
	description: string;
	path: Exclude<SettingsPath, "/settings">;
	icon: RemixiconComponentType;
	activePaths?: readonly SettingsPath[];
};

function SettingsLayout() {
	const location = useLocation();
	const settingsSections: SettingsSection[] = [
		{
			id: "account",
			label: m.settings_account(),
			description: m.settings_account_description(),
			path: "/settings/account",
			icon: RiUserSettingsLine,
			activePaths: ["/settings/change-email", "/settings/user-verification"],
		},
		{
			id: "security",
			label: m.settings_security(),
			description: m.settings_security_description(),
			path: "/settings/security",
			icon: RiShieldKeyholeLine,
			activePaths: ["/settings/change-password", "/settings/sessions"],
		},
		{
			id: "privacy",
			label: m.settings_resources(),
			description: m.settings_resources_description(),
			path: "/settings/privacy",
			icon: RiFileShieldLine,
		},
		{
			id: "theme",
			label: m.settings_theme(),
			description: m.settings_theme_description(),
			path: "/settings/theme",
			icon: RiPaletteLine,
		},
		{
			id: "language",
			label: m.settings_language(),
			description: m.settings_language_description(),
			path: "/settings/language",
			icon: RiTranslate2,
		},
	];
	const isOverview =
		location.pathname === "/settings" || location.pathname === "/settings/";

	return (
		<main className="min-h-screen min-w-0 flex-1 bg-background">
			<div className="lg:grid lg:grid-cols-[25rem_minmax(0,1fr)]">
				<section
					className={`h-screen px-4 ${!isOverview ? "hidden lg:block " : ""}`}
				>
					<AppHeader>
						<AppHeaderLeftPart>
							<AppHeaderTitle>{m.settings_title()}</AppHeaderTitle>
						</AppHeaderLeftPart>
					</AppHeader>

					<nav className="space-y-1" aria-label={m.settings_sections_label()}>
						{settingsSections.map((section) => {
							const isSelected =
								location.pathname === section.path ||
								location.pathname.startsWith(`${section.path}/`) ||
								section.activePaths?.some((path) => location.pathname === path);
							return (
								<SettingRowItem
									icon={section.icon}
									title={section.label}
									description={section.description}
									to={section.path}
									key={section.id}
									isSelected={isSelected}
								/>
							);
						})}
					</nav>
				</section>

				<section
					className={cn(
						"min-w-0 px-4 lg:px-10",
						isOverview && "hidden lg:block",
					)}
				>
					<Outlet />
				</section>
			</div>
		</main>
	);
}
