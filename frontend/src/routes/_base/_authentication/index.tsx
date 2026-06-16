import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/features/authentication/login/login.form";
import { UserVerificationGoals } from "@/features/authentication/user-verification/user-verification-gloal";

export const Route = createFileRoute("/_base/_authentication/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	return (
		<LoginForm
			onSuccess={() =>
				navigate({
					to: "/user-verification",
					search: { goal: UserVerificationGoals.login },
				})
			}
		/>
	);
}
