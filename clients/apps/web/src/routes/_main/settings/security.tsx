import { RiComputerLine, RiLockPasswordLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { SettingRowItem } from "@/features/setting/common/setting-row-item.tsx";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/settings/security")({
	component: SecuritySettingsPage,
});

function SecuritySettingsPage() {
	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings" />
					<AppHeaderTitle>{m.settings_security()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="space-y-1">
				<SettingRowItem
					icon={RiLockPasswordLine}
					title={m.settings_change_password()}
					description={m.settings_change_password_description()}
					to="/settings/change-password"
				/>
				<SettingRowItem
					icon={RiComputerLine}
					title={m.settings_sessions()}
					description={m.settings_sessions_description()}
					to="/settings/sessions"
				/>
			</div>
		</>
	);
}
