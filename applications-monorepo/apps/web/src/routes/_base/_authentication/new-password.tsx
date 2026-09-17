import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { NewPasswordForm } from "@/features/authentication/new-password/new-password.form";

export const Route = createFileRoute("/_base/_authentication/new-password")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	return <NewPasswordForm onSuccess={() => navigate({ to: "/home" })} />;
}
