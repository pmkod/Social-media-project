import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "get",
	path: "/collections/{collectionId}/posts",
	summary: "Get posts in a visible bookmark collection",
	tags: [BookmarksRoutesTag],
	request: {
		params: z.object({ collectionId: z.string() }),
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Collection posts" },
	},
});

const getCollectionPostsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { collectionId } = c.req.valid("param");
		const query = c.req.valid("query");
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;

		const collection = await prisma.bookmarkCollection.findFirst({
			where: {
				id: collectionId,
				OR: [
					{ isPublic: true },
					...(authenticatedUserId ? [{ ownerId: authenticatedUserId }] : []),
				],
			},
			select: { id: true, ownerId: true },
		});
		if (!collection) {
			return c.json(
				{ message: "Collection not found" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);

		const blockRelationships = authenticatedUserId
			? await userServiceClient.fetchBlockRelationshipIds(authenticatedUserId)
			: { blockedUserIds: [], blockedByUserIds: [] };
		const hiddenUserIds = Array.from(
			new Set([
				...blockRelationships.blockedUserIds,
				...blockRelationships.blockedByUserIds,
			]),
		);

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
				bookmarks: {
					some: { collectionItems: { some: { collectionId } } },
				},
				...(hiddenUserIds.length > 0
					? { authorId: { notIn: hiddenUserIds } }
					: {}),
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
		const authorIds = Array.from(new Set(items.map((post) => post.authorId)));
		const isCollectionOwner = Boolean(
			authenticatedUserId && authenticatedUserId === collection.ownerId,
		);

		const [authorsMap, likedPostIds, bookmarkedPostIds] = await Promise.all([
			userServiceClient.fetchAuthorsBatch(authorIds, authenticatedUserId),
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
				? isCollectionOwner
					? Promise.resolve(new Set(postIds))
					: prisma.bookmark
							.findMany({
								where: {
									ownerId: authenticatedUserId,
									postId: { in: postIds },
								},
								select: { postId: true },
							})
							.then((bookmarks) => new Set(bookmarks.map((b) => b.postId)))
				: Promise.resolve(new Set<string>()),
		]);

		return c.json({
			posts: items.map((post) => ({
				...post,
				isLikedByAuthenticatedUser: likedPostIds.has(post.id),
				isBookmarkedByAuthenticatedUser: bookmarkedPostIds.has(post.id),
				author: authorsMap.get(post.authorId) ?? null,
			})),
			pagination: { nextCursor, hasNextPage, limit },
		});
	},
});

export { getCollectionPostsRoute };
