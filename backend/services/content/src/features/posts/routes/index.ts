import { createPostRoute } from "./create-post.route";
import { getPostsRoute } from "./get-posts.route";
import { getPostByIdRoute } from "./get-post-by-id.route";
import { updatePostRoute } from "./update-post.route";
import { deletePostRoute } from "./delete-post.route";

const postsRoutes = [
	createPostRoute,
	getPostsRoute,
	getPostByIdRoute,
	updatePostRoute,
	deletePostRoute,
];

export { postsRoutes };
