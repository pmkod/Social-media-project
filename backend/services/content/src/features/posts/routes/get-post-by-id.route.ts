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
		[HttpStatus.NOT_FOUND.code]: { description: "Post not found" },
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
			return c.json({ message: "Post not found" }, HttpStatus.NOT_FOUND.code);
		}

		const authenticatedUserId = c.req.header("X-Authenticated-User-Id");
		if (
			authenticatedUserId &&
			(await userServiceClient.hasBlockRelationship(
				authenticatedUserId,
				post.authorId,
			))
		) {
			return c.json({ message: "Post not found" }, HttpStatus.NOT_FOUND.code);
		}
		const [like, bookmark, authorsMap] = await Promise.all([
			authenticatedUserId
				? prisma.postLike.findUnique({
						where: {
							postId_authorId: {
								postId: id,
								authorId: authenticatedUserId,
							},
						},
						select: { id: true },
					})
				: null,
			authenticatedUserId
				? prisma.bookmark.findUnique({
						where: {
							postId_ownerId: {
								postId: id,
								ownerId: authenticatedUserId,
							},
						},
						select: { id: true },
					})
				: null,
			userServiceClient.fetchAuthorsBatch([post.authorId], authenticatedUserId),
		]);
		const author = authorsMap.get(post.authorId) ?? null;

		return c.json({
			...post,
			isLikedByAuthenticatedUser: Boolean(like),
			isBookmarkedByAuthenticatedUser: Boolean(bookmark),
			author,
		});
	},
});

export { getPostByIdRoute };
