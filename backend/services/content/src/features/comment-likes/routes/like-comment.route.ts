import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentLikesRoutesTag } from "../comment-likes.constants";

const routeDef = createRoute({
	method: "post",
	path: "/comments/{commentId}/likes",
	summary: "Like a comment",
	tags: [CommentLikesRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			commentId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
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
		});

		if (!comment) {
			throw new Error("Comment not found");
		}

		const commentLike = await prisma.commentLike.upsert({
			where: {
				commentId_authorId: {
					commentId,
					authorId: authenticatedUserId,
				},
			},
			update: {},
			create: {
				commentId,
				authorId: authenticatedUserId,
			},
		});

		return c.json(commentLike);
	},
});

export { likeCommentRoute };
