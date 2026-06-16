import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { InternalRoutesTag } from "@/constants/internal.constants";
import { HttpStatus } from "@/core/constants/http-status";
import { verifyAccessToken } from "@/functions/jwt.functions";

const ValidateTokenRequestSchema = z.object({
	token: z.string(),
});

const ValidateTokenResponseSchema = z.object({
	isValid: z.boolean(),
	userId: z.string().optional(),
});

const validateTokenRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/internal/auth/validate-token",
		summary: "Validate an access token",
		tags: [InternalRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: ValidateTokenRequestSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Token validation result",
				content: {
					"application/json": {
						schema: ValidateTokenResponseSchema,
					},
				},
			},
		},
	}),
	handler: async (c) => {
		const { token } = c.req.valid("json");

		try {
			const payload = verifyAccessToken(token);
			return c.json({ isValid: true, userId: payload.userId }, HttpStatus.OK.code);
		} catch {
			return c.json({ isValid: false }, HttpStatus.OK.code);
		}
	},
});

export { validateTokenRoute };
