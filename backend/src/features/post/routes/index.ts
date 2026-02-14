import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { createPostRoute } from "./create-post.routes";

const postRouter = new OpenAPIHono().basePath("/posts");

postRouter.use(controlUserAccess).route("/", createPostRoute);

export { postRouter };
