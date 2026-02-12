import { OpenAPIHono } from "@hono/zod-openapi";
import { getMeRoute } from "./ge-me.route";

const userRouter = new OpenAPIHono().basePath("/users").route("/", getMeRoute);

export { userRouter };
