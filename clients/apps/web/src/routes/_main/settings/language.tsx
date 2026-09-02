import { RiGlobalLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	SettingsHeader,
	SettingsRow,
} from "@/features/settings/settings-page.tsx";

export const Route = createFileRoute("/_main/settings/language")({
	component: LanguageSettingsPage,
});

function LanguageSettingsPage() {
	return (
		<>
			<SettingsHeader
				title="Language"
				description="Language selection will be available soon."
			/>
			<div className="mt-8">
				<SettingsRow
					icon={RiGlobalLine}
					title="Display language"
					description="English"
					trailing={
						<span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
							Coming soon
						</span>
					}
					disabled
				/>
			</div>
		</>
	);
}
