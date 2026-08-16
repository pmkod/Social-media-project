import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";
import { CreateBookmarkCollectionSchema } from "../bookmarks.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/collections",
	summary: "Create a bookmark collection",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": { schema: CreateBookmarkCollectionSchema },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Collection created" },
	},
});

const createCollectionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const body = c.req.valid("json");
		const collection = await prisma.bookmarkCollection.create({
			data: { ...body, ownerId },
		});
		return c.json(
			{ ...collection, bookmarksCount: 0 },
			HttpStatus.CREATED.code,
		);
	},
});

export { createCollectionRoute };
