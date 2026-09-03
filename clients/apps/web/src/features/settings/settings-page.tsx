import { RiArrowLeftLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import type { SettingsPath } from "@/features/setting/common/setting-row-item.tsx";

export type { SettingsPath };

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
