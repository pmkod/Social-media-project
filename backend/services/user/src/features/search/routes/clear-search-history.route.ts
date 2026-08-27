import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { SearchRoutesTag } from "../search.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/search/history",
	summary: "Clear the authenticated user's search history",
	tags: [SearchRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.OK.code]: { description: "Search history cleared" },
	},
});

const clearSearchHistoryRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");

		await prisma.searchHistory.deleteMany({
			where: { ownerId: authenticatedUser.id },
		});

		return c.json({ success: true });
	},
});

export { clearSearchHistoryRoute };
