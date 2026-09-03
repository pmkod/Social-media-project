import { RiLockPasswordLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { SettingRowItem } from "@/features/setting/common/setting-row-item.tsx";
import { SettingsHeader } from "@/features/settings/settings-page.tsx";

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
				<SettingRowItem
					icon={RiLockPasswordLine}
					title="Change your password"
					description="Update your password at any time."
					to="/settings/security/change-password"
				/>
			</div>
		</>
	);
}
