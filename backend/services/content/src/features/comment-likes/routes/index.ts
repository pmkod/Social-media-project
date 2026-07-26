import { likeCommentRoute } from "./like-comment.route";
import { unlikeCommentRoute } from "./unlike-comment.route";
import { getCommentLikesRoute } from "./get-comment-likes.route";

const commentLikesRoutes = [
	likeCommentRoute,
	unlikeCommentRoute,
	getCommentLikesRoute,
];

export { commentLikesRoutes };
