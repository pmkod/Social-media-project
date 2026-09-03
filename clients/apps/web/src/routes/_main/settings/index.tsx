import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/settings/")({
	component: SettingsOverview,
});

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
