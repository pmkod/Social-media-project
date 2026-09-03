import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { ChangeEmailForm } from "@/features/user/change-email/change-email.form.tsx";

export const Route = createFileRoute("/_main/settings/change-email")({
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
			<div className="mt-8 max-w-xl pl-12">
				<ChangeEmailForm
					currentEmail={data?.user.email}
					onSuccess={() => void navigate({ to: "/settings/account" })}
				/>
			</div>
		</>
	);
}
