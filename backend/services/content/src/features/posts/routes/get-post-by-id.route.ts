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
			description: "Post details with medias",
		},
	},
});

const getPostByIdRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { id } = c.req.valid("param");

		const post = await prisma.post.findUnique({
			where: { id },
			select: {
				id: true,
				authorId: true,
				text: true,
				createdAt: true,
				updatedAt: true,
				medias: {
					select: {
						id: true,
						postId: true,
						position: true,
						mediaType: true,
						createdAt: true,
						lowQualityFileId: true,
						lowQualityFile: {
							select: {
								id: true,
								mimeType: true,
								filename: true,
								createdAt: true,
							},
						},
						highQualityFileId: true,
						highQualityFile: {
							select: {
								id: true,
								mimeType: true,
								filename: true,
								createdAt: true,
							},
						},
					},
					orderBy: { position: "asc" },
				},
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

		return c.json(post);
	},
});

export { getPostByIdRoute };
