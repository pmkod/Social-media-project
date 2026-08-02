import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { Configurations } from "./core/configurations";
import { Environments } from "./core/constants/environment.constants";
import { exceptionHandler } from "./core/exceptions/exception.handler";
import { commentLikesRoutes } from "./features/comment-likes/routes";
import { commentsRoutes } from "./features/comments/routes";
import { postLikesRoutes } from "./features/post-likes/routes";
import { postsRoutes } from "./features/posts/routes";

const app = new OpenAPIHono();

app.openapiRoutes(postsRoutes);
app.openapiRoutes(commentsRoutes);
app.openapiRoutes(postLikesRoutes);
app.openapiRoutes(commentLikesRoutes);

app.onError(exceptionHandler);
app.get("/health", (c) => c.json({ status: "ok" }));

if (Configurations.environment.nodeEnv === Environments.development) {
	app.doc("/openapi", {
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Social Media Content Service API",
		},
	});

	app.get("/scalar", Scalar({ url: "/openapi" }));
}

export default {
	port: Configurations.server.port,
	fetch: app.fetch,
};
