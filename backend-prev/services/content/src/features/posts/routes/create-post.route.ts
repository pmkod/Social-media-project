import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { uuidv7 } from "uuidv7";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/database";
import { AppError, ErrorCodes } from "@/core/errors/app-error";
import { PostsRoutesTag } from "../posts.constants";
import { CreatePostValidationSchema } from "../posts.validation-schemas";

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

const createPostRoute = defineOpenAPIRoute<typeof routeDef>({
	route: routeDef,
	handler: async (c) => {
		const authorId = c.req.header("X-User-Id");

		if (!authorId) {
			throw new AppError({
				message: "Missing user identity",
				code: ErrorCodes.UNAUTHORIZED,
				statusCode: 401,
			});
		}

		const body = c.req.valid("json");

		const post = await prisma.post.create({
			data: {
				id: uuidv7(),
				authorId,
				content: body.content,
				mediaUrls: body.mediaUrls ?? [],
			},
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
