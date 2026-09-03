import {
	type RemixiconComponentType,
	RiArrowLeftLine,
	RiArrowRightSLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";

export type SettingsPath =
	| "/settings"
	| "/settings/account"
	| "/settings/account/change-email"
	| "/settings/security"
	| "/settings/security/change-password"
	| "/settings/privacy"
	| "/settings/theme"
	| "/settings/language";

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
