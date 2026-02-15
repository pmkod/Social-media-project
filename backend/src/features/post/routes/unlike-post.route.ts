import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PostRoutesTag } from "../post.constants";
import { UnlikePostValidationSchema } from "../post.validation-schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const routeDef = createRoute({
	method: "delete",
	path: "/:postId/unlike",
	summary: "Unlike post",
	tags: [PostRoutesTag],
	request: {
		params: UnlikePostValidationSchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
	middleware: [controlUserAccess],
});

const unlikePostRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqParams = c.req.valid("param");
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		await prisma.postLike.delete({
			where: {
				postId_likerId: {
					postId: reqParams.postId,
					likerId: loggedInUser.id,
				},
			},
		});

		return c.newResponse(null, 200);
	},
);

export { unlikePostRoute };
