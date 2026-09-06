import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { SessionsRoutesTag } from "../sessions.constants";
import { sessionRepository } from "../sessions.repository";

const routeDef = createRoute({
	method: "post",
	path: "/sessions/logout-others",
	summary: "Disable every session except the current one",
	tags: [SessionsRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.OK.code]: {
			description: "Other sessions disabled",
			content: {
				"application/json": {
					schema: z.object({ disabledCount: z.number().int().nonnegative() }),
				},
			},
		},
	},
});

const logoutOtherSessionsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");

		const disabledCount = await sessionRepository.disableAllOtherSessions(
			authenticatedUser.id,
			authenticatedUser.sessionId,
		);
		return c.json({ disabledCount });
	},
});

export { logoutOtherSessionsRoute };
