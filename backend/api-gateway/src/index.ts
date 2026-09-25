import { Hono } from "hono";
import { cors } from "hono/cors";
import { Configurations } from "./configurations";
import { HttpStatus } from "./constants/http-status";
import { exceptionHandler } from "./exceptions/exception.handler";
import { Exception } from "./exceptions/exception";
import { findRoute, isInternalPath } from "./router";
import { verifyAuthorizationHeader } from "./middleware/verify-authorization-header";
import { sendTo } from "./send";
import type { ApiApiGatewayVariables } from "./types/gateway-variables";

const app = new Hono<{ Variables: ApiApiGatewayVariables }>();

app.use("*", async (c, next) => {
	if (isInternalPath(c.req.path)) {
		throw new Exception({
			message: "Route not found in API Gateway",
			status: HttpStatus.NOT_FOUND.code,
		});
	}

	await next();
});

app.use(cors(Configurations.cors));
app.onError(exceptionHandler);
app.get("/health", (c) => c.json({ status: "ok" }));

app.use("*", async (c) => {
	const route = findRoute(c.req.path);

	if (!route) {
		throw new Exception({
			message: "Route not found in API Gateway",
			status: HttpStatus.NOT_FOUND.code,
		});
	}

	const authorizationHeader = c.req.header("Authorization");
	if (!authorizationHeader) {
		return await sendTo({ c, target: route.target });
	}

	const { authenticatedUser } = await verifyAuthorizationHeader(
		authorizationHeader,
	);

	return await sendTo({ c, target: route.target, authenticatedUser });
});

export { app };

export default {
	port: Configurations.server.port,
	fetch: app.fetch,
};
