import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { followUserRoute } from "./follow-user.route";
import { unfollowUserRoute } from "./unfollow-user.route";

const followRouter = new OpenAPIHono().basePath("/follows");

followRouter.use(controlUserAccess).route("/follow", followUserRoute);

followRouter.use(controlUserAccess).route("/unfollow", unfollowUserRoute);

export { followRouter };
