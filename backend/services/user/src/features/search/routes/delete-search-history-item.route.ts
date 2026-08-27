import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { SearchRoutesTag } from "../search.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/search/history/{historyId}",
	summary: "Delete one item from the authenticated user's search history",
	tags: [SearchRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ historyId: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "Search history item deleted" },
	},
});

const deleteSearchHistoryItemRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");
		const { historyId } = c.req.valid("param");

		const result = await prisma.searchHistory.deleteMany({
			where: { id: historyId, ownerId: authenticatedUser.id },
		});

		return c.json({ success: result.count > 0 });
	},
});

export { deleteSearchHistoryItemRoute };
