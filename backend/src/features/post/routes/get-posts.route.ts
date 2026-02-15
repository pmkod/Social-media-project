import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PostRoutesTag } from "../post.constants";

const routeDef = createRoute({
	method: "get",
	path: "/",
	summary: "Get posts",
	tags: [PostRoutesTag],
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const getPostsRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		const posts = await prisma.post.findMany({
			select: {
				id: true,
				content: true,
				createdAt: true,
				likeCount: true,
				commentCount: true,
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
		});

		return c.json({ posts });
	},
);

export { getPostsRoute };
