import { addBookmarkRoute } from "./add-bookmark.route";
import { addPostToCollectionRoute } from "./add-post-to-collection.route";
import { createCollectionRoute } from "./create-collection.route";
import { deleteCollectionRoute } from "./delete-collection.route";
import { editCollectionRoute } from "./edit-collection.route";
import { getBookmarksRoute } from "./get-bookmarks.route";
import { getCollectionPostsRoute } from "./get-collection-posts.route";
import { getMyCollectionsRoute } from "./get-my-collections.route";
import { removeBookmarkRoute } from "./remove-bookmark.route";
import { removePostFromCollectionRoute } from "./remove-post-from-collection.route";

const bookmarksRoutes = [
	addBookmarkRoute,
	removeBookmarkRoute,
	getBookmarksRoute,
	createCollectionRoute,
	editCollectionRoute,
	getMyCollectionsRoute,
	getCollectionPostsRoute,
	addPostToCollectionRoute,
	removePostFromCollectionRoute,
	deleteCollectionRoute,
];

export { bookmarksRoutes };
