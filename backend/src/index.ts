import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { exceptionHandler } from "./core/exceptions/exception.handler";
import { authenticationRouter } from "./features/authentication/routes";
import { commentRouter } from "./features/comment/routes";
import { postRouter } from "./features/post/routes";
import { userRouter } from "./features/user/routes";

const app = new OpenAPIHono();

const port = 8000;

app.route("/", authenticationRouter);
app.route("/", userRouter);
app.route("/", postRouter);
app.route("/", commentRouter);
// app.route("/", authenticationRouter);
// app.route("/", authenticationRouter);

app.onError(exceptionHandler);

app.doc("/documentation", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "Social media API",
	},
});

app.get("/scalar", Scalar({ url: "/documentation" }));

export default {
	port,
	fetch: app.fetch,
};
