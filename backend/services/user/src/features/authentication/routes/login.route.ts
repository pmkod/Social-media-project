import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { sendMail } from "@/core/services/mail.service";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import {
	comparePasswordToHash,
	generateUserVerificationCode,
	generateUserVerificationToken,
	hashUserVerificationCode,
} from "../authentication.functions";
import { LoginValidationSchema } from "../authentication.validation-schemas";

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
				description: "Success",
			},
		},
	}),
	handler: async (c) => {
		const reqBody = c.req.valid("json");
		const { emailOrUsername, password } = reqBody;

		const user = await prisma.user.findFirst({
			where: {
				OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
				active: true,
			},
		});

		if (!user) {
			throw new Error("Invalid email/username or password. Please try again");
		}

		const isPasswordValid = await comparePasswordToHash({
			password,
			hash: user.password,
		});

		if (!isPasswordValid) {
			throw new Error("Invalid email/username or password. Please try again");
		}

		const code = generateUserVerificationCode();
		const token = generateUserVerificationToken();
		const codeHash = await hashUserVerificationCode(code);

		const userVerification = await prisma.userVerification.create({
			data: {
				email: user.email,
				username: user.username,
				code: codeHash,
				token,
				numberOfFailedAttempts: 0,
				numberOfCodeTransfersViaEmail: 1,
				goal: UserVerificationGoals.login,
				userId: user.id,
			},
			select: {
				id: true,
				token: true,
			},
		});

		await sendMail({
			receiver: user.email,
			subject: "User verification",
			content: `Your validation code is ${code}`,
		});

		return c.json({ userVerification });
	},
});

export { loginRoute };
