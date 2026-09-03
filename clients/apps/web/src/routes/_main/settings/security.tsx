import { RiLockPasswordLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { SettingRowItem } from "@/features/setting/common/setting-row-item.tsx";

export const Route = createFileRoute("/_main/settings/security")({
	component: SecuritySettingsPage,
});

function SecuritySettingsPage() {
	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings" />
					<AppHeaderTitle>Security</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
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
