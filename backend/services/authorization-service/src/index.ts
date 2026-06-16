import { OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "bun";
import { environment } from "@/core/config/environment.configuration";
import { handleError } from "@/core/errors/error-handler";

const app = new OpenAPIHono();

app.onError(handleError);

app.doc("/openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "Authorization Service API",
		version: "0.1.0",
	},
});

serve({
	fetch: app.fetch,
	port: Number(environment.PORT),
});

console.log(`authorization-service HTTP server running on port ${environment.PORT}`);
