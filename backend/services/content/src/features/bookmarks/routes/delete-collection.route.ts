import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/collections/{collectionId}",
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
		const ownerId = c.get("authenticatedUser")?.id;
		if (!ownerId) throw new Error("Unauthorized");
		const { collectionId } = c.req.valid("param");
		const collection = await prisma.bookmarkCollection.findFirst({
			where: { id: collectionId, ownerId },
			select: { id: true },
		});
		if (!collection) {
			return c.json(
				{ message: "Collection not found" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		await prisma.$transaction(async (tx) => {
			const collectionItems = await tx.bookmarkCollectionItem.findMany({
				where: { collectionId: collection.id },
				select: { bookmarkId: true },
			});

			await tx.bookmarkCollection.delete({
				where: { id: collection.id },
			});

			if (collectionItems.length > 0) {
				await tx.bookmark.deleteMany({
					where: {
						id: { in: collectionItems.map((item) => item.bookmarkId) },
						collectionItems: { none: {} },
					},
				});
			}
		});

		return c.json({ message: "Collection deleted successfully" });
	},
});

export { deleteCollectionRoute };
