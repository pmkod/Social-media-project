import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { sessionServiceClient } from "@/core/services/session-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { AuthenticationRoutesTag } from "../authentication.constants";
import { requireUserAuthentication } from "../middlewares/require-user-authentication.middleware";

const routeDef = createRoute({
	method: "post",
	path: "/authentication/logout",
	summary: "Logout user",
	tags: [AuthenticationRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.OK.code]: {
			description: "Logged out successfully",
		},
	},
});

const logoutRoute = defineOpenAPIRoute<typeof routeDef, HonoAuthenticatedEnv>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");

		await sessionServiceClient.disableSession(
			authenticatedUser.id,
			authenticatedUser.sessionId,
		);

		return c.json({ message: "Logged out successfully" });
	},
});
export { logoutRoute };
