import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import { sendMail } from "@/features/mail/mail.service";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import {
	generateUserVerificationCode,
	generateUserVerificationToken,
} from "../authentication.functions";
import { LoginValidationSchema } from "../authentication.validation-schemas";
import { comparePasswordToHash } from "../password.functions";

// import type { HttpStatus } from "@/core/constants/http-status";

const loginRoute = new OpenAPIHono();

const routeDef = createRoute({
	method: "post",
	path: "/login",
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
});

loginRoute.openapi(routeDef, async (c) => {
	const reqBody = c.req.valid("json");
	const { email, password } = LoginValidationSchema.parse(reqBody);
	const userWithGivenEmail = await prisma.user.findUnique({
		where: { email },
	});
	if (userWithGivenEmail === null) {
		throw Error("Email or password incorrect");
	}
	const isPasswordValid = comparePasswordToHash({
		password,
		hash: userWithGivenEmail.password,
	});
	if (!isPasswordValid) {
		throw Error("Email or password incorrect");
	}
	// const ip = req.ip;
	// const agent = req.headers["user-agent"];
	const code = generateUserVerificationCode();
	const token = generateUserVerificationToken();

	const userVerification = await prisma.userVerification.create({
		data: {
			email,
			code,
			token,
			// agent,
			// ip,
			numberOfFailedAttempts: 0,
			numberOfCodeTransfersViaEmail: 0,
			goal: UserVerificationGoals.login,
			userId: userWithGivenEmail.id,
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
	await prisma.userVerification.update({
		where: { id: userVerification.id },
		data: {
			numberOfCodeTransfersViaEmail: { increment: 1 },
		},
	});

	return c.json({ userVerification });
});

export { loginRoute };
