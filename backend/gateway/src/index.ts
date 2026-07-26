import { Hono } from "hono";
import { cors } from "hono/cors";
import { Configurations } from "./configurations";
import { exceptionHandler } from "./exceptions/exception.handler";
import { findRoute } from "./router";
import { verifyAuthorizationHeader } from "./middleware/verify-authorization-header";
import { sendTo } from "./send";
import type { GatewayVariables } from "./types/gateway-variables";

const app = new Hono<{ Variables: GatewayVariables }>();

app.use(cors(Configurations.cors));
app.onError(exceptionHandler);
app.get("/health", (c) => c.json({ status: "ok" }));

app.use("*", async (c) => {
	const route = findRoute(c.req.path);

	if (!route) {
		return c.json({ message: "Route not found in API Gateway" }, 404);
	}

	const authorizationHeader = c.req.header("Authorization");
	if (!authorizationHeader) {
		return await sendTo({ c, target: route.target });
	}

	const { authenticatedUser } = verifyAuthorizationHeader(authorizationHeader);

	return await sendTo({ c, target: route.target, authenticatedUser });
});

export default {
	port: Configurations.server.port,
	fetch: app.fetch,
};
