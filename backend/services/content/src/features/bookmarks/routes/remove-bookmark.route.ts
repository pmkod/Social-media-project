import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/posts/{postId}/bookmarks",
	summary: "Remove a post bookmark and its collection memberships",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ postId: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "Bookmark removed" },
	},
});

const removeBookmarkRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const { postId } = c.req.valid("param");
		await prisma.bookmark.deleteMany({ where: { postId, ownerId } });
		return c.json({
			success: true,
			post: {
				id: postId,
				isBookmarkedByAuthenticatedUser: false,
			},
		});
	},
});

export { removeBookmarkRoute };
