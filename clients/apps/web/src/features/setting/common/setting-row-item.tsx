import {
	type RemixiconComponentType,
	RiArrowRightSLine,
	RiArrowRightUpLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";

export type SettingsPath =
	| "/settings"
	| "/settings/account"
	| "/settings/change-email"
	| "/settings/user-verification"
	| "/settings/security"
	| "/settings/change-password"
	| "/settings/privacy"
	| "/settings/theme"
	| "/settings/language";

export function SettingRowItem({
	icon: Icon,
	title,
	description,
	onClick,
	to,
	href,
	trailing,
	disabled = false,
	isSelected = false,
	isExternal = false,
}: {
	icon?: RemixiconComponentType;
	title: string;
	description?: string;
	onClick?: () => void;
	to?: SettingsPath;
	href?: string;
	trailing?: React.ReactNode;
	disabled?: boolean;
	isSelected?: boolean;
	isExternal?: boolean;
}) {
	const ArrowIcon = isExternal ? RiArrowRightUpLine : RiArrowRightSLine;
	const content = (
		<>
			{Icon ? <Icon className="size-5 shrink-0" /> : null}
			<span className="min-w-0 flex-1">
				<span className="block font-medium">{title}</span>
				{description ? (
					<span className="mt-0.5 block truncate text-xs text-muted-foreground">
						{description}
					</span>
				) : null}
			</span>
			{trailing !== undefined ? (
				trailing
			) : href || to ? (
				<ArrowIcon className="size-5 shrink-0 opacity-60" />
			) : null}
		</>
	);
	const className =
		"group flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:hover:bg-transparent";
	const stateClassName = isSelected ? "bg-accent" : "hover:bg-accent";
	const rowClassName = `${className} ${stateClassName}`;

	if (to) {
		return (
			<Link to={to} className={rowClassName}>
				{content}
			</Link>
		);
	}

	if (href) {
		return (
			<a href={href} className={rowClassName}>
				{content}
			</a>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={rowClassName}
		>
			{content}
		</button>
	);
}
