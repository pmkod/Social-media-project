import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PostRoutesTag } from "../post.constants";
import { CreatePostValidationSchema } from "../post.validation-schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const routeDef = createRoute({
	method: "post",
	path: "/",
	summary: "Create post",
	tags: [PostRoutesTag],
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: CreatePostValidationSchema,
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

const createPostRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqBody = c.req.valid("form");
		reqBody.content;
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		const post = await prisma.post.create({
			data: {
				content: reqBody.content,
				authorId: loggedInUser.id,
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

export { createPostRoute };
