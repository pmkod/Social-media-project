import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { Configurations } from "./core/configurations";
import { Environments } from "./core/constants/environment.constants";
import { getRedis } from "./core/databases";
import { exceptionHandler } from "./core/exceptions/exception.handler";
import { setAuthenticatedUser } from "./features/authentication/middlewares/set-authenticated-user.middleware";
import { sessionsRoutes } from "./features/sessions/routes";

const app = new OpenAPIHono();

app.use("*", setAuthenticatedUser);
app.openapiRoutes(sessionsRoutes);
app.onError(exceptionHandler);
app.get("/health", async (c) => {
	const redis = await getRedis();
	await redis.ping();
	return c.json({ status: "ok" });
});

if (Configurations.environment.nodeEnv === Environments.development) {
	app.doc("/openapi", {
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Social Media Session Service API",
		},
	});

	app.get("/scalar", Scalar({ url: "/openapi" }));
}

export { app };

export default {
	port: Configurations.server.port,
	fetch: app.fetch,
};
