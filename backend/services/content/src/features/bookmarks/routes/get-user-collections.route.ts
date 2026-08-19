import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
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

const getUserCollectionsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;
		if (authenticatedUserId && authenticatedUserId !== userId) {
			const relationships =
				await userServiceClient.fetchBlockRelationshipIds(authenticatedUserId);
			if (
				relationships.blockedUserIds.includes(userId) ||
				relationships.blockedByUserIds.includes(userId)
			) {
				return c.json({ collections: [] });
			}
		}
		return c.json({
			collections: await getBookmarkCollections({
				ownerId: userId,
				includePrivate: authenticatedUserId === userId,
			}),
		});
	},
});

export { getUserCollectionsRoute };
