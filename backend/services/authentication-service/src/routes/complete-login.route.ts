import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { CompleteLoginValidationSchema } from "@/schemas/authentication.validation-schemas";
import { AuthenticationRoutesTag } from "@/constants/authentication.constants";
import { completeLogin } from "@/services/authentication.service";

const completeLoginRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/complete-login",
		summary: "Complete login",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: CompleteLoginValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Login completed",
			},
		},
	}),
	handler: async (c) => {
		const body = c.req.valid("json");
		const tokens = await completeLogin({
			verificationId: body.userVerification.id,
			verificationToken: body.userVerification.token,
			verificationCode: body.userVerification.code,
		});
		return c.json({ success: true, data: tokens }, HttpStatus.OK.code);
	},
});

export { completeLoginRoute };
