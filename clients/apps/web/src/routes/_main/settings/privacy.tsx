import { RiFileShieldLine, RiFileTextLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { SettingRowItem } from "@/features/setting/common/setting-row-item.tsx";

export const Route = createFileRoute("/_main/settings/privacy")({
	component: PrivacySettingsPage,
});

function PrivacySettingsPage() {
	return (
		<div className="">
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton />
					<AppHeaderTitle>Additional resources</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="space-y-1">
				<SettingRowItem
					icon={RiFileShieldLine}
					title="Privacy policy"
					description="Learn how we collect, use, and protect your data."
					href="/privacy-policy"
				/>
				<SettingRowItem
					icon={RiFileTextLine}
					title="Terms of service"
					description="Review the terms for using Goodspace."
					href="/terms-of-service"
				/>
			</div>
		</div>
	);
}
