import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/features/user/profile/profile-view.tsx";

export const Route = createFileRoute("/_main/$username")({
	component: ProfilePage,
});

function ProfilePage() {
	const { username: routeUsername } = Route.useParams();
	const username = routeUsername.startsWith("@")
		? routeUsername.slice(1)
		: routeUsername;
	return <ProfileView username={username} />;
}
