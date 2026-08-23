import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "post",
	path: "/posts/{postId}/bookmarks",
	summary: "Bookmark a post, optionally in a collection",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ postId: z.string() }),
		body: {
			content: {
				"application/json": {
					schema: z.object({ collectionId: z.string().optional() }),
				},
			},
			required: false,
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Post bookmarked" },
	},
});

const addBookmarkRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const { postId } = c.req.valid("param");
		const body = c.req.valid("json");

		const [post, collection] = await Promise.all([
			prisma.post.findUnique({ where: { id: postId }, select: { id: true } }),
			body?.collectionId
				? prisma.bookmarkCollection.findFirst({
						where: { id: body.collectionId, ownerId },
						select: { id: true },
					})
				: null,
		]);
		if (!post) {
			return c.json({ message: "Post not found" }, HttpStatus.NOT_FOUND.code);
		}
		if (body?.collectionId && !collection) {
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

			if (collection) {
				await tx.bookmarkCollectionItem.upsert({
					where: {
						collectionId_bookmarkId: {
							collectionId: collection.id,
							bookmarkId: savedBookmark.id,
						},
					},
					create: {
						collectionId: collection.id,
						bookmarkId: savedBookmark.id,
					},
					update: {},
				});
			}
		});

		return c.json(
			{
				success: true,
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
