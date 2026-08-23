import { checkPostExistsRoute } from "./check-post-exists.route";
import { createPostRoute } from "./create-post.route";
import { deletePostRoute } from "./delete-post.route";
import { getFeedFollowingRoute } from "./get-feed-following.route";
import { getPostByIdRoute } from "./get-post-by-id.route";
import { getPostLikesRoute } from "./get-post-likes.route";
import { getUserLikedPostsRoute } from "./get-user-liked-posts.route";
import { getUserPostsRoute } from "./get-user-posts.route";
import { likePostRoute } from "./like-post.route";
import { searchPostsRoute } from "./search-posts.route";
import { unlikePostRoute } from "./unlike-post.route";

const postsRoutes = [
	createPostRoute,
	getFeedFollowingRoute,
	searchPostsRoute,
	getUserPostsRoute,
	getUserLikedPostsRoute,
	getPostByIdRoute,
	deletePostRoute,
	likePostRoute,
	unlikePostRoute,
	getPostLikesRoute,
	checkPostExistsRoute,
];

export { postsRoutes };
