import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";
import { CreateCommentValidationSchema } from "../comments.validation-schemas";

const CreateCommentRequestBody = z.object({
	content: CreateCommentValidationSchema.shape.content,
});

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
				"multipart/form-data": {
					schema: CreateCommentRequestBody,
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
		const { content } = c.req.valid("form");

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { id: true },
		});

		if (!post) {
			return c.json({ error: "Post not found" }, HttpStatus.NOT_FOUND.code);
		}

		const comment = await prisma.$transaction(async (tx) => {
			const createdComment = await tx.comment.create({
				data: {
					postId,
					authorId: authenticatedUserId,
					content: content.trim(),
				},
				select: {
					id: true,
				},
			});

			await tx.post.update({
				where: { id: postId },
				data: { commentsCount: { increment: 1 } },
			});

			return createdComment;
		});

		const commentToSend = await prisma.comment.findUniqueOrThrow({
			where: {
				id: comment.id,
			},
			select: {
				id: true,
				postId: true,
				authorId: true,
				content: true,
				likesCount: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		const authorsMap = await userServiceClient.fetchAuthorsBatch([
			authenticatedUserId,
		]);
		const author = authorsMap.get(authenticatedUserId) ?? null;

		return c.json(
			{
				message: "Comment created successfully",
				comment: {
					...commentToSend,
					author,
				},
			},
			HttpStatus.CREATED.code,
		);
	},
});

export { createCommentRoute };
