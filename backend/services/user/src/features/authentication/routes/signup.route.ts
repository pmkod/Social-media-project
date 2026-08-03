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
import { SignupValidationSchema } from "../authentication.validation-schemas";
import { hashPassword } from "../password.functions";

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
				description: "Success",
			},
		},
	}),
	handler: async (c) => {
		const reqBody = c.req.valid("json");
		const { email, password, fullName } = reqBody;

		const existingUser = await prisma.user.findFirst({
			where: { email },
		});
		if (existingUser !== null) {
			throw new Error("An account with this email address already exists.");
		}

		const code = generateUserVerificationCode();
		const token = generateUserVerificationToken();
		const passwordHash = await hashPassword(password);

		const userVerification = await prisma.userVerification.create({
			data: {
				email,
				fullName,
				password: passwordHash,
				code,
				token,
				numberOfFailedAttempts: 0,
				numberOfCodeTransfersViaEmail: 1,
				goal: UserVerificationGoals.signup,
			},
			select: {
				id: true,
				token: true,
			},
		});

		await sendMail({
			receiver: email,
			subject: "User verification",
			content: `Your validation code is ${code}`,
		});

		return c.json({ userVerification });
	},
});

export { signupRoute };
