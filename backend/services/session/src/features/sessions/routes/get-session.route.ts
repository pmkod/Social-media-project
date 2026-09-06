import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { HTTPException } from "hono/http-exception";
import { SessionsRoutesTag } from "../sessions.constants";
import { sessionRepository } from "../sessions.repository";
import {
	SessionIdParams,
	SessionSchema,
} from "../sessions.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/sessions/{sessionId}",
	summary: "Get a session",
	tags: [SessionsRoutesTag],
	request: { params: SessionIdParams },
	responses: {
		[HttpStatus.OK.code]: {
			description: "Session",
			content: {
				"application/json": {
					schema: z.object({ session: SessionSchema }),
				},
			},
		},
		[HttpStatus.NOT_FOUND.code]: { description: "Session not found" },
	},
});

const getSessionRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { sessionId } = c.req.valid("param");
		const session = await sessionRepository.getSession(sessionId);
		if (!session) {
			throw new HTTPException(HttpStatus.NOT_FOUND.code, {
				message: "Session not found",
			});
		}

		return c.json({ session });
	},
});

export { getSessionRoute };
