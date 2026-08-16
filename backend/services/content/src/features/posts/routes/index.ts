import { createPostRoute } from "./create-post.route";
import { getFeedFollowingRoute } from "./get-feed-following.route";
import { getPostByIdRoute } from "./get-post-by-id.route";
import { deletePostRoute } from "./delete-post.route";
import { likePostRoute } from "./like-post.route";
import { unlikePostRoute } from "./unlike-post.route";
import { getPostLikesRoute } from "./get-post-likes.route";

const postsRoutes = [
	createPostRoute,
	getFeedFollowingRoute,
	getPostByIdRoute,
	deletePostRoute,
	likePostRoute,
	unlikePostRoute,
	getPostLikesRoute,
];

export { postsRoutes };
