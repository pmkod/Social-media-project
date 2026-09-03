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
					<AppHeaderTitle>Account</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="mt-8 space-y-1">
				<SettingRowItem
					icon={RiMailLine}
					title="Change your email"
					description={data?.user.email ?? "Update your email address."}
					to="/settings/account/change-email"
				/>
			</div>
		</>
	);
}
