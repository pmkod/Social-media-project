import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "get",
	path: "/feed/following",
	summary: "Get following feed with cursor pagination and counts",
	tags: [PostsRoutesTag],
	request: {
		query: z.object({
			authorId: z.string().optional(),
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description:
				"List of posts from following feed with medias, authors and cursor pagination metadata",
		},
	},
});

const getFeedFollowingRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
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

		let targetAuthorIds: string[] | undefined;
		if (query.authorId) {
			if (hiddenUserIds.includes(query.authorId)) {
				return c.json({
					posts: [],
					pagination: { nextCursor: null, hasNextPage: false, limit },
				});
			}
			targetAuthorIds = [query.authorId];
		} else if (authenticatedUserId) {
			const followingIds =
				await userServiceClient.fetchFollowingIds(authenticatedUserId);
			const allowedFollowingIds = followingIds.filter(
				(id) => !hiddenUserIds.includes(id),
			);
			targetAuthorIds = [authenticatedUserId, ...allowedFollowingIds];
		} else {
			return c.json({
				posts: [],
				pagination: { nextCursor: null, hasNextPage: false, limit },
			});
		}

		if (targetAuthorIds.length === 0) {
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
				authorId: { in: targetAuthorIds },
				...(cursorCondition ? cursorCondition : {}),
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			select: {
				id: true,
				authorId: true,
				text: true,
				type: true,
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
			authenticatedUserId,
		);
		const likedPostIds =
			authenticatedUserId && postIds.length > 0
				? new Set(
						(
							await prisma.postLike.findMany({
								where: {
									authorId: authenticatedUserId,
									postId: { in: postIds },
								},
								select: { postId: true },
							})
						).map((like) => like.postId),
					)
				: new Set<string>();
		const bookmarkedPostIds =
			authenticatedUserId && postIds.length > 0
				? new Set(
						(
							await prisma.bookmark.findMany({
								where: {
									ownerId: authenticatedUserId,
									postId: { in: postIds },
									collectionItems: { some: {} },
								},
								select: { postId: true },
							})
						).map((bookmark) => bookmark.postId),
					)
				: new Set<string>();

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

export { getFeedFollowingRoute };
