import { checkCommentExistsRoute } from "./check-comment-exists.route";
import { createCommentRoute } from "./create-comment.route";
import { createCommentReplyRoute } from "./create-comment-reply.route";
import { deleteCommentRoute } from "./delete-comment.route";
import { getCommentLikesRoute } from "./get-comment-likes.route";
import { getCommentRepliesRoute } from "./get-comment-replies.route";
import { getCommentsRoute } from "./get-comments.route";
import { likeCommentRoute } from "./like-comment.route";
import { unlikeCommentRoute } from "./unlike-comment.route";

const commentsRoutes = [
	createCommentRoute,
	createCommentReplyRoute,
	getCommentsRoute,
	getCommentRepliesRoute,
	deleteCommentRoute,
	likeCommentRoute,
	unlikeCommentRoute,
	getCommentLikesRoute,
	checkCommentExistsRoute,
];

export { commentsRoutes };
