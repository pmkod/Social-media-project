import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { getPostList } from "@/features/posts/services/get-post-list.service";
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
			select: { id: true },
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
		return c.json(
			await getPostList({
				where: {
					bookmarks: {
						some: { collectionItems: { some: { collectionId } } },
					},
				},
				cursorId: query.cursorId,
				cursorCreatedAt: query.cursorCreatedAt,
				limit,
				authenticatedUserId,
			}),
		);
	},
});

export { getCollectionPostsRoute };
