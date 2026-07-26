import { createCommentRoute } from "./create-comment.route";
import { getCommentsRoute } from "./get-comments.route";
import { deleteCommentRoute } from "./delete-comment.route";

const commentsRoutes = [
	createCommentRoute,
	getCommentsRoute,
	deleteCommentRoute,
];

export { commentsRoutes };
