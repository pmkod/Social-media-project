import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { EmptyBlock } from "@/core/components/ui/empty-block";
import { createFileRoute } from "@tanstack/react-router";

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
				title="Settings"
				description="Choose a section to manage your account, security, privacy, appearance, or language preferences."
				bordered={false}
			/>
		</div>
	);
}
