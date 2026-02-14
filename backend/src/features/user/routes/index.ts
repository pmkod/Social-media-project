import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getMeRoute } from "./ge-me.route";

const userRouter = new OpenAPIHono()
	.basePath("/users")
	.use(controlUserAccess)
	.route("/", getMeRoute);

export { userRouter };
