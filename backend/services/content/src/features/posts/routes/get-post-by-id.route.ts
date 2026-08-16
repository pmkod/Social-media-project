import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
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
			description: "Post details with medias and author",
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
				likesCount: true,
				commentsCount: true,
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
			},
		});

		if (!post) {
			throw new Error("Post not found");
		}

		const authenticatedUserId = c.req.header("X-Authenticated-User-Id");
		let isLikedByAuthenticatedUser = false;
		if (authenticatedUserId) {
			const like = await prisma.postLike.findUnique({
				where: {
					postId_authorId: {
						postId: id,
						authorId: authenticatedUserId,
					},
				},
				select: { id: true },
			});
			isLikedByAuthenticatedUser = Boolean(like);
		}

		const authorsMap = await userServiceClient.fetchAuthorsBatch([
			post.authorId,
		]);
		const author = authorsMap.get(post.authorId) ?? null;

		return c.json({
			...post,
			isLikedByAuthenticatedUser,
			author,
		});
	},
});

export { getPostByIdRoute };
