import { createPostRoute } from "./create-post.route";
import { getPostsRoute } from "./get-posts.route";
import { getPostByIdRoute } from "./get-post-by-id.route";
import { deletePostRoute } from "./delete-post.route";

const postsRoutes = [
	createPostRoute,
	getPostsRoute,
	getPostByIdRoute,
	deletePostRoute,
];

export { postsRoutes };
