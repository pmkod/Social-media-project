import { createFileRoute } from "@tanstack/react-router";
import { ExploreView } from "@/features/explore/explore-view";

export const Route = createFileRoute("/_main/explore")({
	component: ExplorePage,
});

function ExplorePage() {
	return <ExploreView />;
}
