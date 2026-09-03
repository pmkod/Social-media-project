import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { ChillzSearchSection } from "@/features/chillz/chillz-gallery.tsx";
import { PostSearchList } from "@/features/post/search/post-search-list.tsx";
import { SearchBar } from "@/features/search/search-bar.tsx";
import { UserSearchList } from "@/features/user/search/user-search-list.tsx";

const searchPageSearchParams = z.object({
	q: z.string().trim().max(100).optional(),
});

export const Route = createFileRoute("/_main/_with-right-aside/search")({
	validateSearch: searchPageSearchParams,
	component: SearchPage,
});

function SearchPage() {
	const { q } = Route.useSearch();
	const committedQuery = q?.trim() ?? "";

	return (
		<MainContainer>
			<div className="py-5 sticky top-0 bg-background z-40">
				<SearchBar />
			</div>

			<div className="pb-8">
				<UserSearchList query={committedQuery} />
				<ChillzSearchSection query={committedQuery} />
				<PostSearchList query={committedQuery} />
			</div>
		</MainContainer>
	);
}
