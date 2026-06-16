import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { DoUserVerificationValidationSchema } from "@/schemas/authentication.validation-schemas";
import { AuthenticationRoutesTag } from "@/constants/authentication.constants";
import { markVerificationAsVerified, verifyUserVerificationCode } from "@/services/user-verification.service";

const doUserVerificationRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/user-verification",
		summary: "User verification",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: DoUserVerificationValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Verification successful",
			},
		},
	}),
	handler: async (c) => {
		const body = c.req.valid("json");
		const { userVerification } = body;

		const verification = await verifyUserVerificationCode({
			id: userVerification.id,
			token: userVerification.token,
		});

		if (verification.code !== userVerification.code) {
			return c.json(
				{
					success: false,
					error: {
						code: "VERIFICATION_INVALID",
						message: "Invalid verification code",
					},
				},
				400,
			);
		}

		await markVerificationAsVerified(verification.id);

		return c.newResponse(null, HttpStatus.OK.code);
	},
});

export { doUserVerificationRoute };
