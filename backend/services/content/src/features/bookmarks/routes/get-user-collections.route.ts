import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { BookmarksRoutesTag } from "../bookmarks.constants";
import { getBookmarkCollections } from "../services/get-bookmark-collections.service";

const routeDef = createRoute({
	method: "get",
	path: "/collections/users/{userId}",
	summary: "Get a user's visible bookmark collections",
	tags: [BookmarksRoutesTag],
	request: { params: z.object({ userId: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "Visible bookmark collections" },
	},
});

const getUserCollectionsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const authenticatedUserId = c.req.header("X-Authenticated-User-Id");
		return c.json({
			collections: await getBookmarkCollections({
				ownerId: userId,
				includePrivate: authenticatedUserId === userId,
			}),
		});
	},
});

export { getUserCollectionsRoute };
