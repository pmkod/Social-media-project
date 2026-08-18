import { createFileRoute } from "@tanstack/react-router";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { SearchView } from "@/features/post/search/search-view.tsx";

export const Route = createFileRoute("/_main/search")({
	component: SearchPage,
});

function SearchPage() {
	return (
		<MainContainer>
			<SearchView />
		</MainContainer>
	);
}
