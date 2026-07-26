import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignupForm } from "@/features/authentication/signup/signup.form";

export const Route = createFileRoute("/_base/_authentication/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	return (
		<SignupForm
			onSuccess={() =>
				navigate({ to: "/user-verification", search: { goal: "SIGNUP" } })
			}
		/>
	);
}
