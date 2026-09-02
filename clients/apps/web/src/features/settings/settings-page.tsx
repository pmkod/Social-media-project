import {
	type RemixiconComponentType,
	RiArrowLeftLine,
	RiArrowRightSLine,
	RiFileShieldLine,
	RiPaletteLine,
	RiSearchLine,
	RiShieldKeyholeLine,
	RiTranslate2,
	RiUserSettingsLine,
} from "@remixicon/react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/core/lib/utils.ts";

export type SettingsPath =
	| "/settings"
	| "/settings/account"
	| "/settings/account/change-email"
	| "/settings/security"
	| "/settings/security/change-password"
	| "/settings/privacy"
	| "/settings/theme"
	| "/settings/language";

export type SettingsSectionId =
	| "account"
	| "security"
	| "privacy"
	| "theme"
	| "language";

type SettingsSection = {
	id: SettingsSectionId;
	label: string;
	description: string;
	path: Exclude<SettingsPath, "/settings">;
	icon: RemixiconComponentType;
};

export const settingsSections: SettingsSection[] = [
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

export function SettingsRow({
	icon: Icon,
	title,
	description,
	onClick,
	to,
	href,
	trailing,
	disabled = false,
}: {
	icon: RemixiconComponentType;
	title: string;
	description: string;
	onClick?: () => void;
	to?: SettingsPath;
	href?: string;
	trailing?: React.ReactNode;
	disabled?: boolean;
}) {
	const content = (
		<>
			<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<Icon className="size-5" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block font-medium text-foreground">{title}</span>
				<span className="mt-0.5 block text-sm text-muted-foreground">
					{description}
				</span>
			</span>
			{trailing ?? (
				<RiArrowRightSLine className="size-5 shrink-0 text-muted-foreground" />
			)}
		</>
	);
	const className =
		"flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:hover:bg-transparent";

	if (to) {
		return (
			<Link to={to} className={className}>
				{content}
			</Link>
		);
	}

	if (href) {
		return (
			<a href={href} className={className}>
				{content}
			</a>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={className}
		>
			{content}
		</button>
	);
}

export function SettingsHeader({
	title,
	description,
	backTo = "/settings",
}: {
	title: string;
	description: string;
	backTo?: SettingsPath;
}) {
	return (
		<div className="flex items-start gap-3">
			<Link
				to={backTo}
				aria-label="Back to settings"
				className="mt-0.5 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
			>
				<RiArrowLeftLine className="size-5" />
			</Link>
			<div>
				<h2 className="text-2xl font-bold tracking-tight">{title}</h2>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}

export function SettingsLayout() {
	const location = useLocation();
	const [search, setSearch] = useState("");
	const isOverview =
		location.pathname === "/settings" || location.pathname === "/settings/";
	const filteredSections = settingsSections.filter((section) =>
		section.label.toLowerCase().includes(search.trim().toLowerCase()),
	);

	return (
		<main className="min-h-screen min-w-0 flex-1 bg-background pb-20 text-foreground md:pb-8">
			<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
				<div className="lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
					<section className={cn(!isOverview && "hidden lg:block")}>
						<div className="mb-7">
							<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
							<p className="mt-2 text-sm text-muted-foreground">
								Manage your Goodspace experience.
							</p>
						</div>

						<label className="flex h-11 items-center gap-3 rounded-full bg-muted/70 px-4 text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
							<RiSearchLine className="size-5 shrink-0" />
							<span className="sr-only">Search settings</span>
							<input
								type="search"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search settings"
								className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
							/>
						</label>

						<nav className="mt-6 space-y-1" aria-label="Settings sections">
							{filteredSections.map((section) => {
								const Icon = section.icon;
								const isSelected =
									location.pathname === section.path ||
									location.pathname.startsWith(`${section.path}/`);
								return (
									<Link
										to={section.path}
										key={section.id}
										className={cn(
											"group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
											isSelected && "bg-primary/10 text-primary",
										)}
									>
										<Icon className="size-5 shrink-0" />
										<span className="min-w-0 flex-1">
											<span className="block font-medium">{section.label}</span>
											<span
												className={cn(
													"mt-0.5 block truncate text-xs text-muted-foreground",
													isSelected && "text-primary/70",
												)}
											>
												{section.description}
											</span>
										</span>
										<RiArrowRightSLine className="size-5 shrink-0 opacity-60" />
									</Link>
								);
							})}
							{filteredSections.length === 0 ? (
								<p className="px-3 py-8 text-center text-sm text-muted-foreground">
									No settings found.
								</p>
							) : null}
						</nav>
					</section>

					<section className={cn("min-w-0", isOverview && "hidden lg:block")}>
						<Outlet />
					</section>
				</div>
			</div>
		</main>
	);
}

export function SettingsOverview() {
	return (
		<div className="hidden min-h-96 items-center justify-center rounded-2xl bg-muted/20 px-8 text-center lg:flex">
			<div className="max-w-md">
				<h2 className="text-2xl font-bold tracking-tight">Settings</h2>
				<p className="mt-3 text-sm leading-6 text-muted-foreground">
					Choose a section to manage your account, security, privacy,
					appearance, or language preferences.
				</p>
			</div>
		</div>
	);
}
