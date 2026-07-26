import { OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "bun";
import { environment } from "@/config/environment.configuration";
import { handleError } from "@/errors/error-handler";
import { usersRoutes } from "@/routes";

const app = new OpenAPIHono();

app.onError(handleError);
app.openapiRoutes(usersRoutes);

app.doc("/openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "User Service API",
		version: "0.1.0",
	},
});

serve({
	fetch: app.fetch,
	port: Number(environment.PORT),
});

console.log(`user-service HTTP server running on port ${environment.PORT}`);
