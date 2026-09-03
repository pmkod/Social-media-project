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

const settingsSections: SettingsSection[] = [
	{
		id: "account",
		label: "Account",
		description: "Manage your email address",
		path: "/settings/account",
		icon: RiUserSettingsLine,
		activePaths: ["/settings/change-email", "/settings/user-verification"],
	},
	{
		id: "security",
		label: "Security",
		description: "Keep your account secure",
		path: "/settings/security",
		icon: RiShieldKeyholeLine,
		activePaths: ["/settings/change-password"],
	},
	{
		id: "privacy",
		label: "Additional resources",
		description: "Read our privacy policy and terms",
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
			<div className="lg:grid lg:grid-cols-[25rem_minmax(0,1fr)]">
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
					className={cn("min-w-0 px-10", isOverview && "hidden lg:block")}
				>
					<Outlet />
				</section>
			</div>
		</main>
	);
}
