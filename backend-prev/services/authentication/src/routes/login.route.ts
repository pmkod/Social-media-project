import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { uuidv7 } from "uuidv7";
import { validateUserCredentials } from "@/clients/user-client";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "@/constants/authentication.constants";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/database";
import {
	generateUserVerificationCode,
	generateUserVerificationToken,
} from "@/functions/authentication.functions";
import { LoginValidationSchema } from "@/schemas/authentication.validation-schemas";
import { sendMail } from "@/services/mail.service";

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

		const user = await validateUserCredentials({
			email: body.email,
			password: body.password,
		});

		const code = generateUserVerificationCode();
		const token = generateUserVerificationToken();

		const verification = await prisma.userVerification.create({
			data: {
				id: uuidv7(),
				userId: user.id,
				email: body.email,
				code,
				token,
				goal: UserVerificationGoals.login,
				numberOfCodeTransfersViaEmail: 1,
			},
			select: { id: true, token: true },
		});

		await sendMail({
			receiver: body.email,
			subject: "Verify your login",
			content: `Your verification code is: ${code}`,
		});

		return c.json({ success: true, data: { userVerification: verification } }, HttpStatus.OK.code);
	},
});

export { loginRoute };
