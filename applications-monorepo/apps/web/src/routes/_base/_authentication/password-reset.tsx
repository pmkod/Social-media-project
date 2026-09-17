import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PasswordResetForm } from "@/features/authentication/password-reset/password-reset.form";
import { UserVerificationGoals } from "@/features/authentication/user-verification/user-verification-gloal";

export const Route = createFileRoute("/_base/_authentication/password-reset")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	return (
		<PasswordResetForm
			onSuccess={() =>
				navigate({
					to: "/user-verification",
					search: { goal: UserVerificationGoals.passwordReset },
				})
			}
		/>
	);
}
