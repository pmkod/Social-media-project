import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PostRoutesTag } from "../../post/post.constants";
import { LikeCommentValidationSchema } from "../comment.validation-schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const routeDef = createRoute({
	method: "post",
	path: "/:commentId/like",
	summary: "Like comment",
	tags: [PostRoutesTag],
	request: {
		params: LikeCommentValidationSchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
	middleware: [controlUserAccess],
});

const likeCommentRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqParams = c.req.valid("param");
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		await prisma.commentLike.create({
			data: {
				commentId: reqParams.commentId,
				likerId: loggedInUser.id,
			},
		});

		return c.newResponse(null, 200);
	},
);

export { likeCommentRoute };
