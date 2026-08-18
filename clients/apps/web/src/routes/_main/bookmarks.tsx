import { createFileRoute } from "@tanstack/react-router";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { BookmarkList } from "@/features/bookmark/bookmark-list";

export const Route = createFileRoute("/_main/bookmarks")({
	component: BookmarksPage,
});

function BookmarksPage() {
	return (
		<MainContainer>
			<BookmarkList />
		</MainContainer>
	);
}
