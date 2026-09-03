import { RiMailLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { SettingRowItem } from "@/features/setting/common/setting-row-item.tsx";
import { SettingsHeader } from "@/features/settings/settings-page.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

export const Route = createFileRoute("/_main/settings/account")({
	component: AccountSettingsPage,
});

function AccountSettingsPage() {
	const { data } = useAuthenticatedUser();

	return (
		<>
			<SettingsHeader
				title="Account"
				description="See and update the information connected to your account."
			/>
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
