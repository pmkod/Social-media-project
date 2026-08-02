import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentLikesRoutesTag } from "../comment-likes.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/comments/{commentId}/likes",
	summary: "Unlike a comment",
	tags: [CommentLikesRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			commentId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Comment unliked successfully",
		},
	},
});

const unlikeCommentRoute = defineOpenAPIRoute<
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

		await prisma.commentLike.deleteMany({
			where: {
				commentId,
				authorId: authenticatedUserId,
			},
		});

		return c.json({ success: true, message: "Comment unliked" });
	},
});

export { unlikeCommentRoute };
