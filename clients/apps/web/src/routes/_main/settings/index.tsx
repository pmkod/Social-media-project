import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { EmptyBlock } from "@/core/components/ui/empty-block";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/settings/")({
	component: SettingsOverview,
});

export function SettingsOverview() {
	return (
		<div>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderTitle></AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<EmptyBlock
				title={m.settings_title()}
				description={m.settings_overview_description()}
				bordered={false}
			/>
		</div>
	);
}
