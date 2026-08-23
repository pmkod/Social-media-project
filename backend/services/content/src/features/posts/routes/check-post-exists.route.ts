import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "get",
	path: "/internal/posts/{id}/exists",
	summary: "Check that a post can be used as an internal service target",
	tags: [PostsRoutesTag],
	request: {
		params: z.object({ id: z.string() }),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Post exists" },
		[HttpStatus.NOT_FOUND.code]: { description: "Post not found" },
	},
});

const checkPostExistsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { id } = c.req.valid("param");
		const post = await prisma.post.findUnique({
			where: { id },
			select: { id: true },
		});

		if (!post) {
			return c.json({ exists: false }, HttpStatus.NOT_FOUND.code);
		}

		return c.json({ exists: true });
	},
});

export { checkPostExistsRoute };
