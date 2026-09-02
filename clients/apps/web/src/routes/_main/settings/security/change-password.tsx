import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChangePasswordForm } from "@/features/settings/change-password.form.tsx";
import { SettingsHeader } from "@/features/settings/settings-page.tsx";

export const Route = createFileRoute(
	"/_main/settings/security/change-password",
)({
	component: ChangePasswordSettingsPage,
});

function ChangePasswordSettingsPage() {
	const navigate = useNavigate();

	return (
		<>
			<SettingsHeader
				title="Change password"
				description="Use a strong password that you do not use elsewhere."
				backTo="/settings/security"
			/>
			<ChangePasswordForm
				onSuccess={() => void navigate({ to: "/settings/security" })}
			/>
		</>
	);
}
