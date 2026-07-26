import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostsRoutesTag } from "../posts.constants";
import { UpdatePostValidationSchema } from "../posts.validation-schemas";

const routeDef = createRoute({
	method: "put",
	path: "/posts/{id}",
	summary: "Update an existing post",
	tags: [PostsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				"application/json": {
					schema: UpdatePostValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Post updated",
		},
	},
});

const updatePostRoute = defineOpenAPIRoute<typeof routeDef, HonoAuthenticatedEnv>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { id } = c.req.valid("param");
		const body = c.req.valid("json");

		const existingPost = await prisma.post.findUnique({
			where: { id },
		});

		if (!existingPost) {
			throw new Error("Post not found");
		}

		if (existingPost.authorId !== authenticatedUserId) {
			throw new Error("You are not authorized to update this post");
		}

		const updatedPost = await prisma.post.update({
			where: { id },
			data: body,
		});

		return c.json(updatedPost);
	},
});

export { updatePostRoute };
