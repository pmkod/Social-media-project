import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostsRoutesTag } from "../posts.constants";
import { CreatePostValidationSchema } from "../posts.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/posts",
	summary: "Create a new post",
	tags: [PostsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreatePostValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Post created successfully",
		},
	},
});

const createPostRoute = defineOpenAPIRoute<typeof routeDef, HonoAuthenticatedEnv>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { content, mediaUrls } = c.req.valid("json");

		const post = await prisma.post.create({
			data: {
				authorId: authenticatedUserId,
				content,
				mediaUrls: mediaUrls ?? [],
			},
		});

		return c.json(post, HttpStatus.CREATED.code);
	},
});

export { createPostRoute };
