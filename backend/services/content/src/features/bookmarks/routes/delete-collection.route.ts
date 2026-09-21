import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/content/delete-collection/{collectionId}",
	summary:
		"Delete a bookmark collection and bookmarks that are no longer organized",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ collectionId: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "Collection deleted" },
	},
});

const deleteCollectionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUser").id;
		const { collectionId } = c.req.valid("param");
		const collection = await prisma.bookmarkCollection.findFirst({
			where: { id: collectionId, ownerId },
			select: { id: true },
		});
		if (!collection) {
			throw new Exception({
				code: ExceptionCodes.collection_not_found,
				message: "Collection not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		const unbookmarkedPostIds = await prisma.$transaction(async (tx) => {
			const collectionItems = await tx.bookmarkCollectionItem.findMany({
				where: { collectionId: collection.id },
				select: {
					postId: true,
					bookmark: {
						select: {
							postId: true,
							_count: { select: { collectionItems: true } },
						},
					},
				},
			});

			await tx.bookmarkCollection.delete({
				where: { id: collection.id },
			});

			if (collectionItems.length > 0) {
				await tx.bookmark.deleteMany({
					where: {
						postId: { in: collectionItems.map((item) => item.postId) },
						ownerId,
						collectionItems: { none: {} },
					},
				});
			}

			return collectionItems
				.filter((item) => item.bookmark._count.collectionItems === 1)
				.map((item) => item.bookmark.postId);
		});

		return c.json({
			message: "Collection deleted successfully",
			unbookmarkedPostIds,
		});
	},
});

export { deleteCollectionRoute };
