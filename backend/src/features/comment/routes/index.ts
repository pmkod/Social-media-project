import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { createCommentRoute } from "./create-comment.routes";
import { likeCommentRoute } from "./like-comment.route";
import { unlikeCommentRoute } from "./unlike-comment.route";
import { getCommentsRoute } from "./get-comments.route";

const commentRouter = new OpenAPIHono().basePath("/comments");

commentRouter.use(controlUserAccess).route("/", createCommentRoute);
commentRouter.use(controlUserAccess).route("/", getCommentsRoute);
commentRouter.use(controlUserAccess).route("/", likeCommentRoute);
commentRouter.use(controlUserAccess).route("/", unlikeCommentRoute);

export { commentRouter };
