import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { SignupValidationSchema } from "@/schemas/authentication.validation-schemas";
import { AuthenticationRoutesTag } from "@/constants/authentication.constants";
import { createSignupVerification } from "@/services/authentication.service";

const signupRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/signup",
		summary: "Signup",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: SignupValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Verification created",
			},
		},
	}),
	handler: async (c) => {
		const body = c.req.valid("json");
		const userVerification = await createSignupVerification(body);
		return c.json({ success: true, data: { userVerification } }, HttpStatus.OK.code);
	},
});

export { signupRoute };
