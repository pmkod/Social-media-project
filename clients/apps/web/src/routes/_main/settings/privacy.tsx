import { RiFileShieldLine, RiFileTextLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	SettingsHeader,
	SettingsRow,
} from "@/features/settings/settings-page.tsx";

export const Route = createFileRoute("/_main/settings/privacy")({
	component: PrivacySettingsPage,
});

function PrivacySettingsPage() {
	return (
		<>
			<SettingsHeader
				title="Privacy and safety"
				description="Read how your data is handled and the rules that apply when using Goodspace."
			/>
			<div className="mt-8 space-y-1">
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
		</>
	);
}
