import { addBookmarkRoute } from "./add-bookmark.route";
import { createCollectionRoute } from "./create-collection.route";
import { deleteCollectionRoute } from "./delete-collection.route";
import { editCollectionRoute } from "./edit-collection.route";
import { getBookmarksRoute } from "./get-bookmarks.route";
import { getMyCollectionsRoute } from "./get-my-collections.route";
import { removeBookmarkRoute } from "./remove-bookmark.route";

const bookmarksRoutes = [
	addBookmarkRoute,
	removeBookmarkRoute,
	getBookmarksRoute,
	createCollectionRoute,
	editCollectionRoute,
	getMyCollectionsRoute,
	deleteCollectionRoute,
];

export { bookmarksRoutes };
