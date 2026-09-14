import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
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
		const ownerId = c.get("authenticatedUser").id;
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
			throw new Exception({
				code: ExceptionCodes.post_not_found,
				message: "Post not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}
		if (!collection) {
			throw new Exception({
				code: ExceptionCodes.collection_not_found,
				message: "Collection not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		await prisma.$transaction(async (tx) => {
			await tx.bookmark.upsert({
				where: { postId_ownerId: { postId, ownerId } },
				create: { postId, ownerId },
				update: {},
			});

			await tx.bookmarkCollectionItem.upsert({
				where: {
					collectionId_postId_ownerId: {
						collectionId: bookmarkCollectionId,
						postId,
						ownerId,
					},
				},
				create: {
					collectionId: bookmarkCollectionId,
					postId,
					ownerId,
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
