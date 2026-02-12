import { HttpStatus } from "@/core/constants/http-status";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../../core/databases/postgresql";
import { sendMail } from "../../mail/mail.service";
import {
	AuthenticationRoutesTag,
	USER_VERIFICATION_GOALS,
} from "../authentication.constants";
import {
	generateUserVerificationCode,
	generateUserVerificationToken,
} from "../authentication.functions";
import { PasswordResetValidationSchema } from "../authentication.validation-schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const passwordResetRoute = new OpenAPIHono();

const routeDef = createRoute({
	method: "post",
	path: "/password-reset",
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
			description: "Success",
		},
	},
});

passwordResetRoute.openapi(routeDef, async (c) => {
	const reqBody = c.req.valid("json");
	const { email } = PasswordResetValidationSchema.parse(reqBody);
	const userWithGivenEmail = await prisma.user.findUnique({
		where: { email },
	});
	if (userWithGivenEmail === null) {
		throw Error("Incorrect credentials");
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
			goal: USER_VERIFICATION_GOALS.passwordReset,
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

export { passwordResetRoute };
