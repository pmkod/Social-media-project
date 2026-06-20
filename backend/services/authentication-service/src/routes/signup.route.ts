import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { uuidv7 } from "uuidv7";
import { getUserByEmail } from "@/clients/user-client";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "@/constants/authentication.constants";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/database";
import { AppError, ErrorCodes } from "@/errors/app-error";
import {
	generateUserVerificationCode,
	generateUserVerificationToken,
} from "@/functions/authentication.functions";
import { hashPassword } from "@/functions/password.functions";
import { SignupValidationSchema } from "@/schemas/authentication.validation-schemas";
import { sendMail } from "@/services/mail.service";

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

		const existingUser = await getUserByEmail(body.email);

		if (existingUser?.active) {
			throw new AppError({
				message: "Email already taken",
				code: ErrorCodes.CONFLICT,
				statusCode: 409,
			});
		}

		const code = generateUserVerificationCode();
		const token = generateUserVerificationToken();
		const passwordHash = await hashPassword(body.password);

		const verification = await prisma.userVerification.create({
			data: {
				id: uuidv7(),
				email: body.email,
				fullName: body.fullName,
				passwordHash,
				code,
				token,
				goal: UserVerificationGoals.signup,
				numberOfCodeTransfersViaEmail: 1,
			},
			select: { id: true, token: true },
		});

		await sendMail({
			receiver: body.email,
			subject: "Verify your account",
			content: `Your verification code is: ${code}`,
		});

		return c.json({ success: true, data: { userVerification: verification } }, HttpStatus.OK.code);
	},
});

export { signupRoute };
