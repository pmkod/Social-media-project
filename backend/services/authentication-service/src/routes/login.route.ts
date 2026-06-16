import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { LoginValidationSchema } from "@/schemas/authentication.validation-schemas";
import { AuthenticationRoutesTag } from "@/constants/authentication.constants";
import { createLoginVerification } from "@/services/authentication.service";

const loginRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/login",
		summary: "Login",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: LoginValidationSchema,
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
		const userVerification = await createLoginVerification(body);
		return c.json({ success: true, data: { userVerification } }, HttpStatus.OK.code);
	},
});

export { loginRoute };
