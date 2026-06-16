import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { PostsRoutesTag } from "../posts.constants";
import { CreatePostValidationSchema } from "../posts.validation-schemas";
import { createPost } from "../posts.service";
import type { AuthContext } from "@/core/middleware/auth.middleware";

const routeDef = createRoute({
	method: "post",
	path: "/posts",
	summary: "Create a post",
	tags: [PostsRoutesTag],
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
			description: "Post created",
		},
	},
});

const createPostRoute = defineOpenAPIRoute<typeof routeDef, AuthContext>({
	route: routeDef,
	handler: async (c) => {
		const authorId = c.get("userId");
		const body = c.req.valid("json");
		const post = await createPost({
			authorId,
			content: body.content,
			mediaUrls: body.mediaUrls,
		});
		return c.json(
			{
				success: true,
				data: {
					id: post.id,
					authorId: post.authorId,
					content: post.content,
					mediaUrls: post.mediaUrls,
					createdAt: post.createdAt.toISOString(),
					updatedAt: post.updatedAt.toISOString(),
				},
			},
			HttpStatus.CREATED.code,
		);
	},
});

export { createPostRoute };
