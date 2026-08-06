import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "post",
	path: "/comments/{commentId}/like",
	summary: "Like a comment",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			commentId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Comment liked successfully",
		},
	},
});

const likeCommentRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { commentId } = c.req.valid("param");

		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
			select: { id: true },
		});

		if (!comment) {
			throw new Error("Comment not found");
		}

		const existingLike = await prisma.commentLike.findUnique({
			where: {
				commentId_authorId: {
					commentId,
					authorId: authenticatedUserId,
				},
			},
			select: { id: true },
		});

		if (!existingLike) {
			await prisma.$transaction([
				prisma.commentLike.create({
					data: {
						commentId,
						authorId: authenticatedUserId,
					},
				}),
				prisma.comment.update({
					where: { id: commentId },
					data: { likesCount: { increment: 1 } },
				}),
			]);
		}

		const { likesCount } = await prisma.comment.findUniqueOrThrow({
			where: { id: commentId },
			select: { likesCount: true },
		});

		return c.json(
			{ success: true, message: "Comment liked", likesCount },
			HttpStatus.CREATED.code,
		);
	},
});

export { likeCommentRoute };
