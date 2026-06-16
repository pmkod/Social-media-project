import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { PasswordResetValidationSchema } from "@/schemas/authentication.validation-schemas";
import { AuthenticationRoutesTag } from "@/constants/authentication.constants";
import { createPasswordResetVerification } from "@/services/authentication.service";

const passwordResetRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/password-reset",
		summary: "Password reset",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: PasswordResetValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Password reset verification created",
			},
		},
	}),
	handler: async (c) => {
		const body = c.req.valid("json");
		const userVerification = await createPasswordResetVerification(body);
		return c.json({ success: true, data: { userVerification } }, HttpStatus.OK.code);
	},
});

export { passwordResetRoute };
