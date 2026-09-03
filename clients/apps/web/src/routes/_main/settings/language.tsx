import { RiGlobalLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { SettingRowItem } from "@/features/setting/common/setting-row-item.tsx";

export const Route = createFileRoute("/_main/settings/language")({
	component: LanguageSettingsPage,
});

function LanguageSettingsPage() {
	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings" />
					<AppHeaderTitle>Language</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="mt-8">
				<SettingRowItem
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
