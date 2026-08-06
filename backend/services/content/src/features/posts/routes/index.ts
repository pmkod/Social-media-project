import { createPostRoute } from "./create-post.route";
import { getPostsRoute } from "./get-posts.route";
import { getPostByIdRoute } from "./get-post-by-id.route";
import { deletePostRoute } from "./delete-post.route";
import { likePostRoute } from "./like-post.route";
import { unlikePostRoute } from "./unlike-post.route";
import { getPostLikesRoute } from "./get-post-likes.route";

const postsRoutes = [
	createPostRoute,
	getPostsRoute,
	getPostByIdRoute,
	deletePostRoute,
	likePostRoute,
	unlikePostRoute,
	getPostLikesRoute,
];

export { postsRoutes };
