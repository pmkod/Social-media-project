import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { Configurations } from "./core/configurations";
import { Environments } from "./core/constants/environment.constants";
import { exceptionHandler } from "./core/exceptions/exception.handler";
import { setAuthenticatedUser } from "./features/authentication/middlewares/set-authenticated-user.middleware";
import { authenticationRoutes } from "./features/authentication/routes";
import { userRoutes } from "./features/user/routes";

const app = new OpenAPIHono();

app.use("*", setAuthenticatedUser);
app.openapiRoutes(authenticationRoutes);
app.openapiRoutes(userRoutes);

app.onError(exceptionHandler);
app.get("/health", (c) => c.json({ status: "ok" }));

if (Configurations.environment.nodeEnv === Environments.development) {
	app.doc("/openapi", {
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Social Media User Service API",
		},
	});

	app.get("/scalar", Scalar({ url: "/openapi" }));
}

export default {
	port: Configurations.server.port,
	fetch: app.fetch,
};
