import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "post",
	path: "/posts/{postId}/bookmarks",
	summary: "Bookmark a post in a collection",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ postId: z.string() }),
		body: {
			content: {
				"application/json": {
					schema: z.object({ bookmarkCollectionId: z.string().min(1) }),
				},
			},
			required: true,
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Post added to collection" },
	},
});

const addBookmarkRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUser")?.id;
		if (!ownerId) throw new Error("Unauthorized");
		const { postId } = c.req.valid("param");
		const { bookmarkCollectionId } = c.req.valid("json");

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { id: true },
		});
		const collection = await prisma.bookmarkCollection.findFirst({
			where: { id: bookmarkCollectionId, ownerId },
			select: { id: true },
		});
		if (!post) {
			return c.json({ message: "Post not found" }, HttpStatus.NOT_FOUND.code);
		}
		if (!collection) {
			return c.json(
				{ message: "Collection not found" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		await prisma.$transaction(async (tx) => {
			const savedBookmark = await tx.bookmark.upsert({
				where: { postId_ownerId: { postId, ownerId } },
				create: { postId, ownerId },
				update: {},
				select: { id: true, postId: true, ownerId: true, createdAt: true },
			});

			await tx.bookmarkCollectionItem.upsert({
				where: {
					collectionId_bookmarkId: {
						collectionId: bookmarkCollectionId,
						bookmarkId: savedBookmark.id,
					},
				},
				create: {
					collectionId: bookmarkCollectionId,
					bookmarkId: savedBookmark.id,
				},
				update: {},
			});
		});

		return c.json(
			{
				message: "Post added to collection",
				post: {
					id: post.id,
					isBookmarkedByAuthenticatedUser: true,
				},
			},
			HttpStatus.CREATED.code,
		);
	},
});

export { addBookmarkRoute };
