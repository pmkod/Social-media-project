import { createCommentRoute } from "./create-comment.route";
import { deleteCommentRoute } from "./delete-comment.route";
import { getCommentsRoute } from "./get-comments.route";

const commentsRoutes = [
	createCommentRoute,
	getCommentsRoute,
	deleteCommentRoute,
];

export { commentsRoutes };
