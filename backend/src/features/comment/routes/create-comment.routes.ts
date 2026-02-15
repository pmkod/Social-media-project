import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { CommentRoutesTag } from "../comment.constants";
import { CreateCommentValidationSchema } from "../comment.validation-schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const routeDef = createRoute({
	method: "post",
	path: "/",
	summary: "Create comment",
	tags: [CommentRoutesTag],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateCommentValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
	middleware: [controlUserAccess],
});

const createCommentRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqBody = c.req.valid("json");
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		const user = await prisma.user.findUnique({
			where: {
				id: loggedInUser.id,
				active: true,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
			},
		});
		if (user === null) {
			throw Error();
		}

		const comment = await prisma.comment.create({
			data: {
				content: reqBody.content,
				authorId: loggedInUser.id,
				postId: reqBody.postId,
			},
			select: {
				id: true,
				content: true,
				createdAt: true,
				author: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
					},
				},
			},
		});

		return c.json({ comment });
	},
);

export { createCommentRoute };
