import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PostRoutesTag } from "../post.constants";
import { LikePostValidationSchema } from "../post.validation-schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const routeDef = createRoute({
	method: "post",
	path: "/:postId/like",
	summary: "Like post",
	tags: [PostRoutesTag],
	request: {
		body: {
			content: {
				"application/json": {
					schema: LikePostValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const likePostRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqBody = c.req.valid("json");
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		await prisma.postLike.create({
			data: {
				postId: reqBody.postId,
				likerId: loggedInUser.id,
			},
		});

		return c.newResponse(null, 200);
	},
);

export { likePostRoute };
