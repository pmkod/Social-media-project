import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChangeEmailForm } from "@/features/settings/change-email.form.tsx";
import { SettingsHeader } from "@/features/settings/settings-page.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

export const Route = createFileRoute("/_main/settings/account/change-email")({
	component: ChangeEmailSettingsPage,
});

function ChangeEmailSettingsPage() {
	const navigate = useNavigate();
	const { data } = useAuthenticatedUser();

	return (
		<>
			<SettingsHeader
				title="Change email"
				description="Your new address must be verified before it is saved."
				backTo="/settings/account"
			/>
			<ChangeEmailForm
				currentEmail={data?.user.email}
				onSuccess={() => void navigate({ to: "/settings/account" })}
			/>
		</>
	);
}
