import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { ChangeEmailForm } from "@/features/settings/change-email.form.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

export const Route = createFileRoute("/_main/settings/account/change-email")({
	component: ChangeEmailSettingsPage,
});

function ChangeEmailSettingsPage() {
	const navigate = useNavigate();
	const { data } = useAuthenticatedUser();

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings/account" />
					<AppHeaderTitle>Change email</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<ChangeEmailForm
				currentEmail={data?.user.email}
				onSuccess={() => void navigate({ to: "/settings/account" })}
			/>
		</>
	);
}
