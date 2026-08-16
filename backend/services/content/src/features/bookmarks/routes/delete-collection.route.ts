import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/collections/{collectionId}",
	summary: "Delete a bookmark collection without deleting its bookmarks",
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
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const { collectionId } = c.req.valid("param");
		const deleted = await prisma.bookmarkCollection.deleteMany({
			where: { id: collectionId, ownerId },
		});
		if (deleted.count === 0) {
			return c.json(
				{ message: "Collection not found" },
				HttpStatus.NOT_FOUND.code,
			);
		}
		return c.json({ success: true });
	},
});

export { deleteCollectionRoute };
