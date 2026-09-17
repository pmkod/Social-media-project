import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CompleteSignupForm } from "@/features/authentication/complete-signup/complete-signup.form";

export const Route = createFileRoute(
	"/_base/_authentication/complete-signup",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	return (
		<CompleteSignupForm onSuccess={() => navigate({ to: "/home" })} />
	);
}
