import { RiFileShieldLine, RiFileTextLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { SettingRowItem } from "@/features/setting/common/setting-row-item.tsx";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/settings/privacy")({
	component: PrivacySettingsPage,
});

function PrivacySettingsPage() {
	return (
		<div className="">
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton />
					<AppHeaderTitle>{m.settings_resources()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="space-y-1">
				<SettingRowItem
					icon={RiFileShieldLine}
					title={m.footer_privacy()}
					description={m.settings_resources_privacy_description()}
					href="/privacy-policy"
					isExternal
				/>
				<SettingRowItem
					icon={RiFileTextLine}
					title={m.settings_resources_terms()}
					description={m.settings_resources_terms_description()}
					href="/terms"
					isExternal
				/>
			</div>
		</div>
	);
}
