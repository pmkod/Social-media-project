import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "post",
	path: "/collections/{collectionId}/posts/{postId}",
	summary: "Save a post and add it to a bookmark collection",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ collectionId: z.string(), postId: z.string() }),
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Post added to collection" },
	},
});

const addPostToCollectionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const { collectionId, postId } = c.req.valid("param");
		const [collection, post] = await Promise.all([
			prisma.bookmarkCollection.findFirst({
				where: { id: collectionId, ownerId },
				select: { id: true },
			}),
			prisma.post.findUnique({ where: { id: postId }, select: { id: true } }),
		]);
		if (!collection || !post) {
			return c.json(
				{ message: !collection ? "Collection not found" : "Post not found" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		await prisma.$transaction(async (tx) => {
			const bookmark = await tx.bookmark.upsert({
				where: { postId_ownerId: { postId, ownerId } },
				create: { postId, ownerId },
				update: {},
				select: { id: true },
			});
			await tx.bookmarkCollectionItem.upsert({
				where: {
					collectionId_bookmarkId: {
						collectionId,
						bookmarkId: bookmark.id,
					},
				},
				create: { collectionId, bookmarkId: bookmark.id },
				update: {},
			});
		});

		return c.json(
			{ success: true, isBookmarkedByAuthenticatedUser: true },
			HttpStatus.CREATED.code,
		);
	},
});

export { addPostToCollectionRoute };
