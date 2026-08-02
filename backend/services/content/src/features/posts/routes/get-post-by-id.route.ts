import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "get",
	path: "/posts/{id}",
	summary: "Get single post by ID",
	tags: [PostsRoutesTag],
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Post details",
		},
	},
});

const getPostByIdRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { id } = c.req.valid("param");

		const post = await prisma.post.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						comments: true,
						postLikes: true,
					},
				},
			},
		});

		if (!post) {
			throw new Error("Post not found");
		}

		const { content, ...rest } = post;

		return c.json({ ...rest, text: content });
	},
});

export { getPostByIdRoute };
