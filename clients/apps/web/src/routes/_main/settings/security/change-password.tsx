import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { ChangePasswordForm } from "@/features/settings/change-password.form.tsx";

export const Route = createFileRoute(
	"/_main/settings/security/change-password",
)({
	component: ChangePasswordSettingsPage,
});

function ChangePasswordSettingsPage() {
	const navigate = useNavigate();

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings/security" />
					<AppHeaderTitle>Change password</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<ChangePasswordForm
				onSuccess={() => void navigate({ to: "/settings/security" })}
			/>
		</>
	);
}
