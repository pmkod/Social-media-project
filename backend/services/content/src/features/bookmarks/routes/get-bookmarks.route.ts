import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "get",
	path: "/bookmarks",
	summary:
		"Get the authenticated user's bookmarked posts, optionally filtered by collection",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			bookmarkCollectionId: z.string().optional(),
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Bookmarked posts" },
	},
});

const getBookmarksRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const query = c.req.valid("query");
		if (query.bookmarkCollectionId) {
			const collection = await prisma.bookmarkCollection.findFirst({
				where: {
					id: query.bookmarkCollectionId,
					ownerId,
				},
				select: { id: true },
			});
			if (!collection) {
				return c.json(
					{ message: "Collection not found" },
					HttpStatus.NOT_FOUND.code,
				);
			}
		}
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);

		const blockRelationships =
			await userServiceClient.fetchBlockRelationshipIds(ownerId);
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
					some: query.bookmarkCollectionId
						? {
								ownerId,
								collectionItems: {
									some: { collectionId: query.bookmarkCollectionId },
								},
							}
						: { ownerId, collectionItems: { some: {} } },
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

		const authorsMap = await userServiceClient.fetchAuthorsBatch(
			authorIds,
			ownerId,
		);
		const likedPostIds =
			postIds.length > 0
				? new Set(
						(
							await prisma.postLike.findMany({
								where: { authorId: ownerId, postId: { in: postIds } },
								select: { postId: true },
							})
						).map((like) => like.postId),
					)
				: new Set<string>();

		return c.json({
			posts: items.map((post) => ({
				...post,
				isLikedByAuthenticatedUser: likedPostIds.has(post.id),
				isBookmarkedByAuthenticatedUser: true,
				author: authorsMap.get(post.authorId) ?? null,
			})),
			pagination: { nextCursor, hasNextPage, limit },
		});
	},
});

export { getBookmarksRoute };
