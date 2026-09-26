import { createCommentRoute } from "./create-comment.route";
import { deleteCommentRoute } from "./delete-comment.route";
import { getCommentByIdRoute } from "./get-comment-by-id.route";
import { getCommentLikesRoute } from "./get-comment-likes.route";
import { getCommentsRoute } from "./get-comments.route";
import { likeCommentRoute } from "./like-comment.route";
import { unlikeCommentRoute } from "./unlike-comment.route";

const commentsRoutes = [
	createCommentRoute,
	getCommentByIdRoute,
	getCommentsRoute,
	deleteCommentRoute,
	likeCommentRoute,
	unlikeCommentRoute,
	getCommentLikesRoute,
];

export { commentsRoutes };
