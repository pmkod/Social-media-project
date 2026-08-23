import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/posts/{postId}/bookmarks",
	summary: "Remove a post bookmark or its membership in a specific collection",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ postId: z.string() }),
		query: z.object({ bookmarkCollectionId: z.string().optional() }),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Bookmark removed" },
	},
});

const removeBookmarkRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const { postId } = c.req.valid("param");
		const { bookmarkCollectionId } = c.req.valid("query");

		if (bookmarkCollectionId) {
			const collection = await prisma.bookmarkCollection.findFirst({
				where: { id: bookmarkCollectionId, ownerId },
				select: { id: true },
			});
			if (!collection) {
				return c.json(
					{ message: "Collection not found" },
					HttpStatus.NOT_FOUND.code,
				);
			}

			const bookmark = await prisma.bookmark.findUnique({
				where: { postId_ownerId: { postId, ownerId } },
				select: { id: true },
			});
			if (bookmark) {
				await prisma.bookmarkCollectionItem.deleteMany({
					where: {
						collectionId: bookmarkCollectionId,
						bookmarkId: bookmark.id,
					},
				});
			}

			return c.json({
				success: true,
				post: {
					id: postId,
					isBookmarkedByAuthenticatedUser: Boolean(bookmark),
				},
			});
		}

		await prisma.bookmark.deleteMany({ where: { postId, ownerId } });
		return c.json({
			success: true,
			post: {
				id: postId,
				isBookmarkedByAuthenticatedUser: false,
			},
		});
	},
});

export { removeBookmarkRoute };
