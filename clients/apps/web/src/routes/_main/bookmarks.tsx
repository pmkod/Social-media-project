import { createFileRoute } from "@tanstack/react-router";
import { BookmarkList } from "@/features/bookmark/bookmark-list";

export const Route = createFileRoute("/_main/bookmarks")({
	component: BookmarksPage,
});

function BookmarksPage() {
	return <BookmarkList />;
}
