import { OpenAPIHono } from "@hono/zod-openapi";
import { getMeRoute } from "./get-me.route";
import { getUserRoute } from "./get-user.route";

const userRouter = new OpenAPIHono().basePath("/users");

userRouter.route("/", getMeRoute);
userRouter.route("/", getUserRoute);

export { userRouter };
