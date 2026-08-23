import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";
import { UpdateBookmarkCollectionSchema } from "../bookmarks.validation-schemas";

const routeDef = createRoute({
	method: "put",
	path: "/collections/{collectionId}",
	summary: "Edit a bookmark collection",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ collectionId: z.string() }),
		body: {
			content: {
				"application/json": { schema: UpdateBookmarkCollectionSchema },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Bookmark collection updated" },
	},
});

const editCollectionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");

		const { collectionId } = c.req.valid("param");
		const body = c.req.valid("json");
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

		const updatedCollection = await prisma.bookmarkCollection.update({
			where: { id: collection.id },
			data: body,
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

		const { _count, ...result } = updatedCollection;
		return c.json({
			bookmarkCollection: { ...result, bookmarksCount: _count.items },
		});
	},
});

export { editCollectionRoute };
