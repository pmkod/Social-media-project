import { OpenAPIHono } from "@hono/zod-openapi";
import { createCommentRoute } from "./create-comment.routes";
import { getCommentsRoute } from "./get-comments.route";
import { likeCommentRoute } from "./like-comment.route";
import { unlikeCommentRoute } from "./unlike-comment.route";

const commentRouter = new OpenAPIHono().basePath("/comments");

commentRouter.route("/", createCommentRoute);
commentRouter.route("/", getCommentsRoute);
commentRouter.route("/", likeCommentRoute);
commentRouter.route("/", unlikeCommentRoute);

export { commentRouter };
