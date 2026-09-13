import { RiMailLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { SettingRowItem } from "@/features/setting/common/setting-row-item.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/settings/account")({
	component: AccountSettingsPage,
});

function AccountSettingsPage() {
	const { data } = useAuthenticatedUser();

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings" />
					<AppHeaderTitle>{m.settings_account()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="space-y-1">
				<SettingRowItem
					icon={RiMailLine}
					title={m.settings_change_email()}
					description={data?.user.email ?? m.settings_update_email()}
					to="/settings/change-email"
				/>
			</div>
		</>
	);
}
