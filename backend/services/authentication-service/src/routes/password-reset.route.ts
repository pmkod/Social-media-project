import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { uuidv7 } from "uuidv7";
import { getUserByEmail } from "@/clients/user-client";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "@/constants/authentication.constants";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/db";
import { AppError, ErrorCodes } from "@/errors/app-error";
import {
	generateUserVerificationCode,
	generateUserVerificationToken,
} from "@/functions/authentication.functions";
import { PasswordResetValidationSchema } from "@/schemas/authentication.validation-schemas";
import { sendMail } from "@/services/mail.service";

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

		const user = await getUserByEmail(body.email);

		if (!user || !user.active) {
			throw new AppError({
				message: "Email not found",
				code: ErrorCodes.NOT_FOUND,
				statusCode: 404,
			});
		}

		const code = generateUserVerificationCode();
		const token = generateUserVerificationToken();

		const verification = await prisma.userVerification.create({
			data: {
				id: uuidv7(),
				userId: user.id,
				email: body.email,
				code,
				token,
				goal: UserVerificationGoals.passwordReset,
				numberOfCodeTransfersViaEmail: 1,
			},
			select: { id: true, token: true },
		});

		await sendMail({
			receiver: body.email,
			subject: "Reset your password",
			content: `Your password reset code is: ${code}`,
		});

		return c.json({ success: true, data: { userVerification: verification } }, HttpStatus.OK.code);
	},
});

export { passwordResetRoute };
