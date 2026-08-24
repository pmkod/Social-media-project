import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "get",
	path: "/comments/{commentId}/likes",
	summary: "Get likes for a comment",
	tags: [CommentsRoutesTag],
	request: {
		params: z.object({
			commentId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Likes count and authors",
		},
	},
});

const getCommentLikesRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { commentId } = c.req.valid("param");

		const likes = await prisma.commentLike.findMany({
			where: { commentId },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				authorId: true,
				createdAt: true,
			},
		});
		const count = await prisma.commentLike.count({ where: { commentId } });

		return c.json({ count, likes });
	},
});

export { getCommentLikesRoute };
