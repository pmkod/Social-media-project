import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { SessionsRoutesTag } from "../sessions.constants";
import { sessionRepository } from "../sessions.repository";
import {
	GetActiveSessionsQuery,
	SessionSchema,
} from "../sessions.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/sessions/active",
	summary: "Get all active sessions for a user",
	tags: [SessionsRoutesTag],
	request: { query: GetActiveSessionsQuery },
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

const getAllActiveSessionsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("query");
		const sessions = await sessionRepository.getAllActiveSessions(userId);
		return c.json({ sessions });
	},
});

export { getAllActiveSessionsRoute };
