import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { CommentRoutesTag } from "../comment.constants";
import { GetCommentsValidationSchema } from "../comment.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/",
	summary: "Get comments",
	tags: [CommentRoutesTag],
	request: {
		params: GetCommentsValidationSchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const getCommentsRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqParams = c.req.valid("param");
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		const comments = await prisma.comment.findMany({
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
			orderBy: {
				createdAt: "desc",
			},
			where: {
				postId: reqParams.postId,
			},
		});

		return c.json({ comments });
	},
);

export { getCommentsRoute };
