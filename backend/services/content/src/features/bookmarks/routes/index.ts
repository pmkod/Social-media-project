import { addBookmarkRoute } from "./add-bookmark.route";
import { addPostToCollectionRoute } from "./add-post-to-collection.route";
import { createCollectionRoute } from "./create-collection.route";
import { deleteCollectionRoute } from "./delete-collection.route";
import { getBookmarksRoute } from "./get-bookmarks.route";
import { getCollectionPostsRoute } from "./get-collection-posts.route";
import { getMyCollectionsRoute } from "./get-my-collections.route";
import { getUserCollectionsRoute } from "./get-user-collections.route";
import { removeBookmarkRoute } from "./remove-bookmark.route";
import { removePostFromCollectionRoute } from "./remove-post-from-collection.route";

const bookmarksRoutes = [
	addBookmarkRoute,
	removeBookmarkRoute,
	getBookmarksRoute,
	createCollectionRoute,
	getMyCollectionsRoute,
	getUserCollectionsRoute,
	getCollectionPostsRoute,
	addPostToCollectionRoute,
	removePostFromCollectionRoute,
	deleteCollectionRoute,
];

export { bookmarksRoutes };
