import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/collections/{collectionId}/posts/{postId}",
	summary: "Remove a post from a collection while keeping its bookmark",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ collectionId: z.string(), postId: z.string() }),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Post removed from collection" },
	},
});

const removePostFromCollectionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const { collectionId, postId } = c.req.valid("param");
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

		await prisma.bookmarkCollectionItem.deleteMany({
			where: {
				collectionId,
				bookmark: { postId, ownerId },
			},
		});
		return c.json({ success: true });
	},
});

export { removePostFromCollectionRoute };
