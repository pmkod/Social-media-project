import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
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
	middleware: [requireUserAuthentication],
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

const getSessionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");
		const { sessionId } = c.req.valid("param");
		const session = await sessionRepository.getSession(sessionId);
		if (!session || session.userId !== authenticatedUser.id) {
			throw new HTTPException(HttpStatus.NOT_FOUND.code, {
				message: "Session not found",
			});
		}

		return c.json({ session });
	},
});

export { getSessionRoute };
