import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { Prisma } from "@/generated/prisma/client";
import { BookmarksRoutesTag } from "../bookmarks.constants";
import { UpdateBookmarkCollectionSchema } from "../bookmarks.validation-schemas";

const routeDef = createRoute({
	method: "put",
	path: "/content/edit-collection/{collectionId}",
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
		[HttpStatus.CONFLICT.code]: {
			description: "A collection with this name already exists",
		},
	},
});

const editCollectionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUser").id;

		const { collectionId } = c.req.valid("param");
		const body = c.req.valid("json");
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

		try {
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
					_count: {
						select: {
							items: { where: { bookmark: { post: { exists: true } } } },
						},
					},
				},
			});

			const { _count, ...result } = updatedCollection;
			return c.json({
				bookmarkCollection: { ...result, bookmarksCount: _count.items },
			});
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				throw new Exception({
					code: ExceptionCodes.collection_name_already_exists,
					message: "A collection with this name already exists",
					status: HttpStatus.CONFLICT.code,
				});
			}
			throw error;
		}
	},
});

export { editCollectionRoute };
