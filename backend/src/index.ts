import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { authenticationRouter } from "./features/authentication/routes";
import { userRouter } from "./features/user/routes";

const app = new OpenAPIHono();

const port = 8000;

app.route("/", authenticationRouter);
app.route("/", userRouter);
// app.route("/", userRouter);
// app.route("/", authenticationRouter);
// app.route("/", authenticationRouter);

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
