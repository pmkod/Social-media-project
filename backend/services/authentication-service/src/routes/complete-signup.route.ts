import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { CompleteSignupValidationSchema } from "@/schemas/authentication.validation-schemas";
import { AuthenticationRoutesTag } from "@/constants/authentication.constants";
import { completeSignup } from "@/services/authentication.service";

const completeSignupRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/complete-signup",
		summary: "Complete signup",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: CompleteSignupValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Signup completed",
			},
		},
	}),
	handler: async (c) => {
		const body = c.req.valid("json");
		const tokens = await completeSignup({
			verificationId: body.userVerification.id,
			verificationToken: body.userVerification.token,
			verificationCode: body.userVerification.code,
			username: body.username,
		});
		return c.json({ success: true, data: tokens }, HttpStatus.OK.code);
	},
});

export { completeSignupRoute };
