import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { SessionsRoutesTag } from "../sessions.constants";
import { sessionService } from "../sessions.service";
import {
	SessionIdParams,
	SessionSchema,
} from "../sessions.validation-schemas";

const routeDef = createRoute({
	method: "patch",
	path: "/session/disable-session/{sessionId}",
	summary: "Disable a session",
	tags: [SessionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: SessionIdParams },
	responses: {
		[HttpStatus.OK.code]: {
			description: "Session disabled",
			content: {
				"application/json": {
					schema: z.object({ session: SessionSchema }),
				},
			},
		},
		[HttpStatus.NOT_FOUND.code]: { description: "Session not found" },
	},
});

const disableSessionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		const { sessionId } = c.req.valid("param");
		const existingSession = await sessionService.getSession(sessionId);
		if (!existingSession || existingSession.userId !== authenticatedUser.id) {
			throw new Exception({
				code: ExceptionCodes.session_not_found,
				message: "Session not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}
		const session = await sessionService.disableSession(sessionId);
		if (!session)
			throw new Exception({
				code: ExceptionCodes.session_disable_failed,
				message: "Unable to disable session",
				status: HttpStatus.INTERNAL_SERVER_ERROR.code,
			});

		return c.json({ session });
	},
});

export { disableSessionRoute };
