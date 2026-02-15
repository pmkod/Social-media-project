import { OpenAPIHono } from "@hono/zod-openapi";
import { followUserRoute } from "./follow-user.route";
import { unfollowUserRoute } from "./unfollow-user.route";

const followRouter = new OpenAPIHono().basePath("/follows");

followRouter.route("/follow", followUserRoute);

followRouter.route("/unfollow", unfollowUserRoute);

export { followRouter };
