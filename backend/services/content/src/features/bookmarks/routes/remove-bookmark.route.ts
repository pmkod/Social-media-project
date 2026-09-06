import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/posts/{postId}/bookmarks",
	summary: "Remove a post from a bookmark collection",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ postId: z.string() }),
		query: z.object({ bookmarkCollectionId: z.string().min(1) }),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Post removed from collection" },
	},
});

const removeBookmarkRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUser").id;
		const { postId } = c.req.valid("param");
		const { bookmarkCollectionId } = c.req.valid("query");

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

		const isBookmarked = await prisma.$transaction(async (tx) => {
			const bookmark = await tx.bookmark.findUnique({
				where: { postId_ownerId: { postId, ownerId } },
				select: { id: true },
			});
			if (!bookmark) return false;

			await tx.bookmarkCollectionItem.deleteMany({
				where: {
					collectionId: bookmarkCollectionId,
					bookmarkId: bookmark.id,
				},
			});

			const remainingCollectionItems = await tx.bookmarkCollectionItem.count({
				where: { bookmarkId: bookmark.id },
			});
			if (remainingCollectionItems === 0) {
				await tx.bookmark.delete({ where: { id: bookmark.id } });
				return false;
			}

			return true;
		});

		return c.json({
			message: "Post removed from collection",
			post: {
				id: postId,
				isBookmarkedByAuthenticatedUser: isBookmarked,
			},
		});
	},
});

export { removeBookmarkRoute };
