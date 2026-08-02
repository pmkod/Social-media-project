import { likePostRoute } from "./like-post.route";
import { unlikePostRoute } from "./unlike-post.route";
import { getPostLikesRoute } from "./get-post-likes.route";

const postLikesRoutes = [likePostRoute, unlikePostRoute, getPostLikesRoute];

export { postLikesRoutes };
