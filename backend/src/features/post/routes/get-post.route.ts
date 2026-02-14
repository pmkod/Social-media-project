import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PostRoutesTag } from "../post.constants";
import { GetPostValidationSchema } from "../post.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/:postId",
	summary: "Get posts",
	tags: [PostRoutesTag],
	request: {
		params: GetPostValidationSchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const getPostRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqParams = c.req.valid("param");
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		const post = await prisma.post.findUnique({
			where: {
				id: reqParams.postId,
			},
			select: {
				id: true,
				content: true,
				createdAt: true,
				author: {
					select: {
						id: true,
						fullName: true,
						username: true,
					},
				},
			},
		});

		return c.json({ post });
	},
);

export { getPostRoute };
