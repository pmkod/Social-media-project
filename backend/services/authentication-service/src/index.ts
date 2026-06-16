import { OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "bun";
import { environment } from "@/core/config/environment.configuration";
import { handleError } from "@/core/errors/error-handler";
import { authenticationRoutes } from "@/routes";

const app = new OpenAPIHono();

app.onError(handleError);
app.openapiRoutes(authenticationRoutes);

app.doc("/openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "Authentication Service API",
		version: "0.1.0",
	},
});

serve({
	fetch: app.fetch,
	port: Number(environment.PORT),
});

console.log(`authentication-service HTTP server running on port ${environment.PORT}`);
