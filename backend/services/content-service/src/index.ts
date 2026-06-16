import { OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "bun";
import { environment } from "@/core/config/environment.configuration";
import { handleError } from "@/core/errors/error-handler";
import { authMiddleware } from "@/core/middleware/auth.middleware";
import { postsRoutes } from "@/features/posts/routes";

const app = new OpenAPIHono();

app.use("/posts/*", authMiddleware);
app.onError(handleError);
app.openapiRoutes(postsRoutes);

app.doc("/openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "Content Service API",
		version: "0.1.0",
	},
});

serve({
	fetch: app.fetch,
	port: Number(environment.PORT),
});

console.log(`content-service HTTP server running on port ${environment.PORT}`);
