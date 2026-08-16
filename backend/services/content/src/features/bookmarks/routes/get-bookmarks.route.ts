import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { getPostList } from "@/features/posts/services/get-post-list.service";
import { BookmarksRoutesTag } from "../bookmarks.constants";

const routeDef = createRoute({
	method: "get",
	path: "/bookmarks",
	summary: "Get the authenticated user's bookmarked posts",
	tags: [BookmarksRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Bookmarked posts" },
	},
});

const getBookmarksRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const ownerId = c.get("authenticatedUserId");
		if (!ownerId) throw new Error("Unauthorized");
		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);
		return c.json(
			await getPostList({
				where: { bookmarks: { some: { ownerId } } },
				cursorId: query.cursorId,
				cursorCreatedAt: query.cursorCreatedAt,
				limit,
				authenticatedUserId: ownerId,
			}),
		);
	},
});

export { getBookmarksRoute };
