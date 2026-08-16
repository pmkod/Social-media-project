import { createFileRoute } from "@tanstack/react-router";
import { SearchView } from "@/features/post/search/search-view.tsx";

export const Route = createFileRoute("/_main/search")({
	component: SearchPage,
});

function SearchPage() {
	return <SearchView />;
}
