import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";
import { CreateCommentValidationSchema } from "../comments.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/posts/{postId}/comments",
	summary: "Add a comment to a post",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			postId: z.string(),
		}),
		body: {
			content: {
				"application/json": {
					schema: CreateCommentValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Comment created",
		},
	},
});

const createCommentRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { postId } = c.req.valid("param");
		const { content } = c.req.valid("json");

		const post = await prisma.post.findUnique({
			where: { id: postId },
		});

		if (!post) {
			throw new Error("Post not found");
		}

		const comment = await prisma.comment.create({
			data: {
				postId,
				authorId: authenticatedUserId,
				content,
			},
		});

		return c.json(comment, HttpStatus.CREATED.code);
	},
});

export { createCommentRoute };
