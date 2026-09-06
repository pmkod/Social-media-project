import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { SessionsRoutesTag } from "../sessions.constants";
import { sessionRepository } from "../sessions.repository";
import {
	CreateSessionRequestBody,
	SessionWithTokenSchema,
} from "../sessions.validation-schemas";

const normalizeHeader = (value: string | undefined, maxLength: number) => {
	const normalizedValue = value?.trim();
	return normalizedValue ? normalizedValue.slice(0, maxLength) : null;
};

const routeDef = createRoute({
	method: "post",
	path: "/internal/sessions",
	summary: "Create a session from a trusted service",
	tags: [SessionsRoutesTag],
	request: {
		body: {
			content: {
				"application/json": { schema: CreateSessionRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Session created",
			content: {
				"application/json": {
					schema: z.object({ session: SessionWithTokenSchema }),
				},
			},
		},
	},
});

const createSessionRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const data = c.req.valid("json");
		const forwardedIpAddress = c.req.header("x-forwarded-for")?.split(",")[0];
		const session = await sessionRepository.createSession({
			userId: data.userId,
			ipAddress:
				data.ipAddress ??
				normalizeHeader(
					forwardedIpAddress ?? c.req.header("x-real-ip"),
					255,
				),
			userAgent:
				data.userAgent ?? normalizeHeader(c.req.header("user-agent"), 1024),
		});

		return c.json({ session }, HttpStatus.CREATED.code);
	},
});

export { createSessionRoute };
