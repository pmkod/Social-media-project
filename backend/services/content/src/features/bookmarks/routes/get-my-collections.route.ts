import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";
import { getBookmarkCollections } from "../services/get-bookmark-collections.service";

const routeDef = createRoute({
	method: "get",
	path: "/collections",
	summary: "Get the authenticated user's bookmark collections",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.OK.code]: { description: "Bookmark collections" },
	},
});

const getMyCollectionsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		return c.json({
			collections: await getBookmarkCollections({
				ownerId,
				includePrivate: true,
			}),
		});
	},
});

export { getMyCollectionsRoute };
