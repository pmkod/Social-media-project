import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PostRoutesTag } from "../../post/post.constants";
import { UnlikeCommentValidationSchema } from "../comment.validation-schemas";

const routeDef = createRoute({
	method: "delete",
	path: "/:commentId/unlike",
	summary: "Unlike comment",
	tags: [PostRoutesTag],
	request: {
		params: UnlikeCommentValidationSchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
	middleware: [controlUserAccess],
});

const unlikeCommentRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqParams = c.req.valid("param");
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		await prisma.commentLike.delete({
			where: {
				commentId_likerId: {
					commentId: reqParams.commentId,
					likerId: loggedInUser.id,
				},
			},
		});

		return c.newResponse(null, 200);
	},
);

export { unlikeCommentRoute };
