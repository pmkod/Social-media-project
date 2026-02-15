import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { createPostRoute } from "./create-post.route";
import { getPostRoute } from "./get-post.route";
import { getPostsRoute } from "./get-posts.route";
import { likePostRoute } from "./like-post.route";
import { unlikePostRoute } from "./unlike-post.route";

const postRouter = new OpenAPIHono().basePath("/posts");

postRouter.use(controlUserAccess).route("/", createPostRoute);
postRouter.route("/", getPostsRoute);
postRouter.route("/", getPostRoute);
postRouter.use(controlUserAccess).route("/", likePostRoute);
postRouter.use(controlUserAccess).route("/", unlikePostRoute);

export { postRouter };
