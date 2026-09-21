import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "get",
	path: "/content/get-comment-likes/{commentId}",
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
		const comment = await prisma.comment.findFirst({
			where: { id: commentId, exists: true, post: { exists: true } },
			select: { id: true },
		});
		if (!comment) return c.json({ count: 0, likes: [] });

		const likes = await prisma.commentLike.findMany({
			where: { commentId },
			orderBy: { createdAt: "desc" },
			select: {
				authorId: true,
				createdAt: true,
			},
		});
		const count = await prisma.commentLike.count({ where: { commentId } });

		return c.json({
			count,
			likes: likes.map((like) => ({ id: like.authorId, ...like })),
		});
	},
});

export { getCommentLikesRoute };
