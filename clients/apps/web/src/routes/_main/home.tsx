import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/features/post/feed/feed";

export const Route = createFileRoute("/_main/home")({
	component: HomePage,
});

function HomePage() {
	return <Feed />;
}
