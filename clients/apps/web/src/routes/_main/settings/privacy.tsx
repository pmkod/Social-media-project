import { RiFileShieldLine, RiFileTextLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { SettingsRow } from "@/features/settings/settings-page.tsx";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";

export const Route = createFileRoute("/_main/settings/privacy")({
	component: PrivacySettingsPage,
});

function PrivacySettingsPage() {
	return (
		<div className="">
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton />
					<AppHeaderTitle>Privacy and safety</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="space-y-1">
				<SettingsRow
					icon={RiFileShieldLine}
					title="Privacy policy"
					description="Learn how we collect, use, and protect your data."
					href="/privacy-policy"
				/>
				<SettingsRow
					icon={RiFileTextLine}
					title="Terms of service"
					description="Review the terms for using Goodspace."
					href="/terms-of-service"
				/>
			</div>
		</div>
	);
}
