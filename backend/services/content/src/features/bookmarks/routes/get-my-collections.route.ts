import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "get",
	path: "/collections",
	summary: "Get the authenticated user's bookmark collections",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			postId: z.string().optional(),
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
			q: z.string().optional(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Bookmark collections" },
	},
});

const getMyCollectionsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser?.id) throw new Error("Unauthorized");
		const query = c.req.valid("query");
		const searchQuery = query.q?.trim();
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
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

		const collections = await prisma.bookmarkCollection.findMany({
			where: {
				ownerId: authenticatedUser.id,
				...(searchQuery
					? {
							name: { contains: searchQuery, mode: "insensitive" as const },
						}
					: {}),
				...(cursorCondition ? cursorCondition : {}),
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			select: {
				id: true,
				ownerId: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true,
				_count: { select: { items: true } },
			},
		});
		const hasNextPage = collections.length > limit;
		const items = hasNextPage ? collections.slice(0, limit) : collections;
		const lastItem = items.at(-1);
		const nextCursor =
			hasNextPage && lastItem
				? { id: lastItem.id, createdAt: lastItem.createdAt.toISOString() }
				: null;
		const collectionIds = items.map((collection) => collection.id);
		const selectedCollectionIds =
			query.postId && collectionIds.length > 0
				? new Set(
						(
							await prisma.bookmarkCollectionItem.findMany({
								where: {
									collectionId: { in: collectionIds },
									bookmark: {
										postId: query.postId,
										ownerId: authenticatedUser.id,
									},
								},
								select: { collectionId: true },
							})
						).map((item) => item.collectionId),
					)
				: new Set<string>();

		return c.json({
			bookmarkCollections: items.map(({ _count, ...collection }) => ({
				...collection,
				bookmarksCount: _count.items,
				isPostInCollection: selectedCollectionIds.has(collection.id),
			})),
			pagination: { nextCursor, hasNextPage, limit },
		});
	},
});

export { getMyCollectionsRoute };
