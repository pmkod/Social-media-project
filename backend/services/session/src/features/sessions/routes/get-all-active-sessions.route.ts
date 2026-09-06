import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { SessionsRoutesTag } from "../sessions.constants";
import { sessionRepository } from "../sessions.repository";
import { SessionSchema } from "../sessions.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/sessions/active",
	summary: "Get all active sessions for a user",
	tags: [SessionsRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.OK.code]: {
			description: "Active sessions",
			content: {
				"application/json": {
					schema: z.object({ sessions: z.array(SessionSchema) }),
				},
			},
		},
	},
});

const getAllActiveSessionsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		const sessions = await sessionRepository.getAllActiveSessions(
			authenticatedUser.id,
		);
		return c.json({ sessions });
	},
});

export { getAllActiveSessionsRoute };
