import { RiLockPasswordLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	SettingsHeader,
	SettingsRow,
} from "@/features/settings/settings-page.tsx";

export const Route = createFileRoute("/_main/settings/security")({
	component: SecuritySettingsPage,
});

function SecuritySettingsPage() {
	return (
		<>
			<SettingsHeader
				title="Security"
				description="Manage the information that protects access to your account."
			/>
			<div className="mt-8 space-y-1">
				<SettingsRow
					icon={RiLockPasswordLine}
					title="Change your password"
					description="Update your password at any time."
					to="/settings/security/change-password"
				/>
			</div>
		</>
	);
}
