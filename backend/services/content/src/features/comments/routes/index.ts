import { checkCommentExistsRoute } from "./check-comment-exists.route";
import { createCommentRoute } from "./create-comment.route";
import { deleteCommentRoute } from "./delete-comment.route";
import { getCommentLikesRoute } from "./get-comment-likes.route";
import { getCommentsRoute } from "./get-comments.route";
import { likeCommentRoute } from "./like-comment.route";
import { unlikeCommentRoute } from "./unlike-comment.route";

const commentsRoutes = [
	createCommentRoute,
	getCommentsRoute,
	deleteCommentRoute,
	likeCommentRoute,
	unlikeCommentRoute,
	getCommentLikesRoute,
	checkCommentExistsRoute,
];

export { commentsRoutes };
