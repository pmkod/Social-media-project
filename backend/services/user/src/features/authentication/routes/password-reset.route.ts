import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { sendMail } from "@/core/services/mail.service";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import {
	generateUserVerificationCode,
	generateUserVerificationToken,
} from "../authentication.functions";
import { PasswordResetValidationSchema } from "../authentication.validation-schemas";

const passwordResetRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/password-reset",
		summary: "Request password reset",
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
				description: "Password reset code sent",
			},
		},
	}),
	handler: async (c) => {
		const { email } = c.req.valid("json");

		const user = await prisma.user.findUnique({
			where: { email, active: true },
		});

		if (!user) {
			throw new Error("User with given email does not exist");
		}

		const code = generateUserVerificationCode();
		const token = generateUserVerificationToken();

		const userVerification = await prisma.userVerification.create({
			data: {
				email,
				code,
				token,
				numberOfFailedAttempts: 0,
				numberOfCodeTransfersViaEmail: 1,
				goal: UserVerificationGoals.passwordReset,
				userId: user.id,
			},
			select: {
				id: true,
				token: true,
			},
		});

		await sendMail({
			receiver: email,
			subject: "Password Reset Code",
			content: `Your password reset code is ${code}`,
		});

		return c.json({ userVerification });
	},
});

export { passwordResetRoute };
