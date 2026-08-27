import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { CommentsRoutesTag } from "../comments.constants";

const routeDef = createRoute({
	method: "get",
	path: "/internal/comments/{id}/exists",
	summary: "Check that a comment can be used as an internal service target",
	tags: [CommentsRoutesTag],
	request: {
		params: z.object({ id: z.string() }),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Comment exists" },
		[HttpStatus.NOT_FOUND.code]: { description: "Comment not found" },
	},
});

const checkCommentExistsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { id } = c.req.valid("param");
		const comment = await prisma.comment.findUnique({
			where: { id },
			select: { id: true, deletedAt: true },
		});

		if (!comment || comment.deletedAt) {
			return c.json({ exists: false }, HttpStatus.NOT_FOUND.code);
		}

		return c.json({ exists: true });
	},
});

export { checkCommentExistsRoute };
