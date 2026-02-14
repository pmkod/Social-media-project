import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { createCommentRoute } from "./create-comment.routes";

const commentRouter = new OpenAPIHono().basePath("/comments");

commentRouter.use(controlUserAccess).route("/", createCommentRoute);

export { commentRouter };
