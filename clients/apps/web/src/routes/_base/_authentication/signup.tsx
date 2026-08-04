import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignupForm } from "@/features/authentication/signup/signup.form";
import { UserVerificationGoals } from "@/features/authentication/user-verification/user-verification-gloal";

export const Route = createFileRoute("/_base/_authentication/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	return (
		<SignupForm
			onSuccess={() =>
				navigate({
					to: "/user-verification",
					search: { goal: UserVerificationGoals.signup },
				})
			}
		/>
	);
}
