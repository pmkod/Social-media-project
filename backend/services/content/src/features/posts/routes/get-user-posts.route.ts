import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "get",
	path: "/posts/users/{userId}",
	summary: "Get posts created by a user",
	tags: [PostsRoutesTag],
	request: {
		params: z.object({ userId: z.string() }),
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "User posts" },
	},
});

const getUserPostsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;

		const blockRelationships = authenticatedUserId
			? await userServiceClient.fetchBlockRelationshipIds(authenticatedUserId)
			: { blockedUserIds: [], blockedByUserIds: [] };
		const hiddenUserIds = Array.from(
			new Set([
				...blockRelationships.blockedUserIds,
				...blockRelationships.blockedByUserIds,
			]),
		);

		if (hiddenUserIds.includes(userId)) {
			return c.json({
				posts: [],
				pagination: { nextCursor: null, hasNextPage: false, limit },
			});
		}

		const cursorDate = query.cursorCreatedAt
			? new Date(query.cursorCreatedAt)
			: null;
		const hasValidCursor =
			cursorDate !== null &&
			!Number.isNaN(cursorDate.getTime()) &&
			query.cursorId;
		const cursorCondition = hasValidCursor
			? {
					OR: [
						{ createdAt: { lt: cursorDate } },
						{ createdAt: cursorDate, id: { lt: query.cursorId } },
					],
				}
			: undefined;

		const posts = await prisma.post.findMany({
			where: {
				authorId: userId,
				...(cursorCondition ? cursorCondition : {}),
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
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

		const hasNextPage = posts.length > limit;
		const items = hasNextPage ? posts.slice(0, limit) : posts;
		const lastItem = items.at(-1);
		const nextCursor =
			hasNextPage && lastItem
				? { id: lastItem.id, createdAt: lastItem.createdAt.toISOString() }
				: null;

		const postIds = items.map((post) => post.id);

		const [authorsMap, likedPostIds, bookmarkedPostIds] = await Promise.all([
			items.length > 0
				? userServiceClient.fetchAuthorsBatch([userId], authenticatedUserId)
				: Promise.resolve(new Map()),
			authenticatedUserId && postIds.length > 0
				? prisma.postLike
						.findMany({
							where: {
								authorId: authenticatedUserId,
								postId: { in: postIds },
							},
							select: { postId: true },
						})
						.then((likes) => new Set(likes.map((like) => like.postId)))
				: Promise.resolve(new Set<string>()),
			authenticatedUserId && postIds.length > 0
				? prisma.bookmark
						.findMany({
							where: {
								ownerId: authenticatedUserId,
								postId: { in: postIds },
								collectionItems: { some: {} },
							},
							select: { postId: true },
						})
						.then((bookmarks) => new Set(bookmarks.map((b) => b.postId)))
				: Promise.resolve(new Set<string>()),
		]);

		const singleAuthor = authorsMap.get(userId) ?? null;

		return c.json({
			posts: items.map((post) => ({
				...post,
				isLikedByAuthenticatedUser: likedPostIds.has(post.id),
				isBookmarkedByAuthenticatedUser: bookmarkedPostIds.has(post.id),
				author: singleAuthor,
			})),
			pagination: { nextCursor, hasNextPage, limit },
		});
	},
});

export { getUserPostsRoute };
