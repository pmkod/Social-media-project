import {
	type RemixiconComponentType,
	RiArrowLeftLine,
	RiArrowRightSLine,
	RiComputerLine,
	RiFileShieldLine,
	RiFileTextLine,
	RiGlobalLine,
	RiLockPasswordLine,
	RiMailLine,
	RiMoonLine,
	RiPaletteLine,
	RiSearchLine,
	RiShieldKeyholeLine,
	RiSunLine,
	RiTranslate2,
	RiUserSettingsLine,
} from "@remixicon/react";
import { useState } from "react";
import { useTheme } from "@/core/hooks/use-theme.ts";
import { cn } from "@/core/lib/utils.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { ChangeEmailForm } from "./change-email.form.tsx";
import { ChangePasswordForm } from "./change-password.form.tsx";

type SettingsSectionId =
	| "account"
	| "security"
	| "privacy"
	| "theme"
	| "language";

type SettingsAction = "change-email" | "change-password" | null;

type SettingsSection = {
	id: SettingsSectionId;
	label: string;
	description: string;
	icon: RemixiconComponentType;
};

const settingsSections: SettingsSection[] = [
	{
		id: "account",
		label: "Account",
		description: "Manage your email address",
		icon: RiUserSettingsLine,
	},
	{
		id: "security",
		label: "Security",
		description: "Keep your account secure",
		icon: RiShieldKeyholeLine,
	},
	{
		id: "privacy",
		label: "Privacy and safety",
		description: "Review privacy and terms",
		icon: RiFileShieldLine,
	},
	{
		id: "theme",
		label: "Theme",
		description: "Choose how Goodspace looks",
		icon: RiPaletteLine,
	},
	{
		id: "language",
		label: "Language",
		description: "Choose your display language",
		icon: RiTranslate2,
	},
];

function SettingsRow({
	icon: Icon,
	title,
	description,
	onClick,
	href,
	trailing,
	disabled = false,
}: {
	icon: RemixiconComponentType;
	title: string;
	description: string;
	onClick?: () => void;
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

function DetailHeader({
	title,
	description,
	onBack,
}: {
	title: string;
	description: string;
	onBack: () => void;
}) {
	return (
		<div className="flex items-start gap-3">
			<button
				type="button"
				onClick={onBack}
				aria-label="Back to settings"
				className="mt-0.5 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
			>
				<RiArrowLeftLine className="size-5" />
			</button>
			<div>
				<h2 className="text-2xl font-bold tracking-tight">{title}</h2>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}

function ActionHeader({
	title,
	description,
	onBack,
}: {
	title: string;
	description: string;
	onBack: () => void;
}) {
	return (
		<div className="flex items-start gap-3">
			<button
				type="button"
				onClick={onBack}
				aria-label="Back"
				className="mt-0.5 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
			>
				<RiArrowLeftLine className="size-5" />
			</button>
			<div>
				<h2 className="text-2xl font-bold tracking-tight">{title}</h2>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}

function SettingsDetail({
	section,
	action,
	setAction,
	onMobileBack,
}: {
	section: SettingsSectionId;
	action: SettingsAction;
	setAction: (action: SettingsAction) => void;
	onMobileBack: () => void;
}) {
	const { data } = useAuthenticatedUser();
	const { theme, setTheme, mounted } = useTheme();

	if (action === "change-email") {
		return (
			<>
				<ActionHeader
					title="Change email"
					description="Your new address must be verified before it is saved."
					onBack={() => setAction(null)}
				/>
				<ChangeEmailForm
					currentEmail={data?.user.email}
					onSuccess={() => setAction(null)}
				/>
			</>
		);
	}

	if (action === "change-password") {
		return (
			<>
				<ActionHeader
					title="Change password"
					description="Use a strong password that you do not use elsewhere."
					onBack={() => setAction(null)}
				/>
				<ChangePasswordForm onSuccess={() => setAction(null)} />
			</>
		);
	}

	if (section === "security") {
		return (
			<>
				<DetailHeader
					title="Security"
					description="Manage the information that protects access to your account."
					onBack={onMobileBack}
				/>
				<div className="mt-8 space-y-1">
					<SettingsRow
						icon={RiLockPasswordLine}
						title="Change your password"
						description="Update your password at any time."
						onClick={() => setAction("change-password")}
					/>
				</div>
			</>
		);
	}

	if (section === "privacy") {
		return (
			<>
				<DetailHeader
					title="Privacy and safety"
					description="Read how your data is handled and the rules that apply when using Goodspace."
					onBack={onMobileBack}
				/>
				<div className="mt-8 space-y-1">
					<SettingsRow
						icon={RiFileShieldLine}
						title="Privacy policy"
						description="Learn how we collect, use, and protect your data."
						href="/privacy-policy"
					/>
					<SettingsRow
						icon={RiFileTextLine}
						title="Terms of service"
						description="Review the terms for using Goodspace."
						href="/terms-of-service"
					/>
				</div>
			</>
		);
	}

	if (section === "theme") {
		const themes = [
			{ id: "light", label: "Light", icon: RiSunLine },
			{ id: "dark", label: "Dark", icon: RiMoonLine },
			{ id: "system", label: "System", icon: RiComputerLine },
		] as const;

		return (
			<>
				<DetailHeader
					title="Theme"
					description="Choose the appearance that feels best to you."
					onBack={onMobileBack}
				/>
				<div className="mt-8 grid gap-3 sm:grid-cols-3">
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
									"flex cursor-pointer items-center gap-3 rounded-xl bg-muted/60 px-4 py-5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									isSelected && "bg-primary/10 text-primary",
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

	if (section === "language") {
		return (
			<>
				<DetailHeader
					title="Language"
					description="Language selection will be available soon."
					onBack={onMobileBack}
				/>
				<div className="mt-8">
					<SettingsRow
						icon={RiGlobalLine}
						title="Display language"
						description="English"
						trailing={
							<span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
								Coming soon
							</span>
						}
						disabled
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<DetailHeader
				title="Account"
				description="See and update the information connected to your account."
				onBack={onMobileBack}
			/>
			<div className="mt-8 space-y-1">
				<SettingsRow
					icon={RiMailLine}
					title="Change your email"
					description={data?.user.email ?? "Update your email address."}
					onClick={() => setAction("change-email")}
				/>
			</div>
		</>
	);
}

function SettingsPage() {
	const [selectedSection, setSelectedSection] =
		useState<SettingsSectionId>("account");
	const [action, setAction] = useState<SettingsAction>(null);
	const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
	const [search, setSearch] = useState("");
	const filteredSections = settingsSections.filter((section) =>
		section.label.toLowerCase().includes(search.trim().toLowerCase()),
	);

	const selectSection = (section: SettingsSectionId) => {
		setSelectedSection(section);
		setAction(null);
		setMobileDetailOpen(true);
	};

	return (
		<main className="min-h-screen min-w-0 flex-1 bg-background pb-20 text-foreground md:pb-8">
			<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
				<div className="lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
					<section className={cn(mobileDetailOpen && "hidden lg:block")}>
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
								const isSelected = selectedSection === section.id;
								return (
									<button
										type="button"
										key={section.id}
										onClick={() => selectSection(section.id)}
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
									</button>
								);
							})}
							{filteredSections.length === 0 ? (
								<p className="px-3 py-8 text-center text-sm text-muted-foreground">
									No settings found.
								</p>
							) : null}
						</nav>
					</section>

					<section
						className={cn("min-w-0", !mobileDetailOpen && "hidden lg:block")}
					>
						<SettingsDetail
							section={selectedSection}
							action={action}
							setAction={setAction}
							onMobileBack={() => setMobileDetailOpen(false)}
						/>
					</section>
				</div>
			</div>
		</main>
	);
}

export { SettingsPage };
