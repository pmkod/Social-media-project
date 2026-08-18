import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/features/user/profile/profile-view.tsx";
import { MainContainer } from "@/core/components/ui/main-container";

export const Route = createFileRoute("/_main/$username")({
	component: ProfilePage,
});

function ProfilePage() {
	const { username: routeUsername } = Route.useParams();
	const username = routeUsername.startsWith("@")
		? routeUsername.slice(1)
		: routeUsername;
	return (
		<MainContainer>
			<ProfileView username={username} />
		</MainContainer>
	);
}
