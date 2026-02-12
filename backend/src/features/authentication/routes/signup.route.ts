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
import { SignupValidationSchema } from "../authentication.validation-schemas";
import { hashPassword } from "../password.functions";

// import type { HttpStatus } from "@/core/constants/http-status";

const signupRoute = new OpenAPIHono();

const routeDef = createRoute({
	method: "post",
	path: "/signup",
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
});

signupRoute.openapi(routeDef, async (c) => {
	const reqBody = c.req.valid("json");

	const { firstName, lastName, email, password, storeName, role } = reqBody;
	const userWithGivenEmail = await prisma.user.findUnique({ where: { email } });
	if (userWithGivenEmail !== null) {
		throw Error("Email already taken");
	}
	// const ip = req.ip;
	// const agent = req.headers["user-agent"];
	const code = generateUserVerificationCode();
	const token = generateUserVerificationToken();
	const passwordHash = hashPassword(password);
	const userVerification = await prisma.userVerification.create({
		data: {
			firstName,
			lastName,
			email,
			storeName,
			password: passwordHash,
			code,
			token,
			// agent,
			// ip,
			numberOfFailedAttempts: 0,
			numberOfCodeTransfersViaEmail: 0,
			goal: UserVerificationGoals.signup,
			userRole: role,
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

export { signupRoute };
