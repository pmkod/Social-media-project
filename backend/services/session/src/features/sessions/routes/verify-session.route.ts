import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { SessionsRoutesTag } from "../sessions.constants";
import { sessionService } from "../sessions.service";
import {
	SessionSchema,
	VerifySessionRequestBody,
} from "../sessions.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/internal/session/verify-session",
	summary: "Verify active session credentials",
	tags: [SessionsRoutesTag],
	request: {
		body: {
			content: {
				"application/json": { schema: VerifySessionRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Valid active session",
			content: {
				"application/json": {
					schema: z.object({ session: SessionSchema }),
				},
			},
		},
		[HttpStatus.UNAUTHORIZED.code]: {
			description: "Invalid or inactive session",
		},
	},
});

const verifySessionRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const session = await sessionService.verifySession(c.req.valid("json"));

		return c.json({ session });
	},
});

export { verifySessionRoute };
