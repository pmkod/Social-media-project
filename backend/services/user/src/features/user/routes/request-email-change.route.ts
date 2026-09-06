import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { sendMail } from "@/core/services/mail.service";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { UserVerificationGoals } from "@/features/authentication/authentication.constants";
import {
	generateUserVerificationCode,
	generateUserVerificationToken,
	hashUserVerificationCode,
} from "@/features/authentication/authentication.functions";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";
import { RequestEmailChangeValidationSchema } from "../user.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/users/me/email-change-request",
	summary: "Request an email address change",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": { schema: RequestEmailChangeValidationSchema },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Verification code sent" },
		[HttpStatus.CONFLICT.code]: { description: "Email already in use" },
	},
});

const requestEmailChangeRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");

		const newEmail = c.req.valid("json").newEmail.toLowerCase();
		const user = await prisma.user.findUnique({
			where: { id: authenticatedUser.id, active: true },
			select: { email: true },
		});

		if (!user) {
			throw new Error("User not found");
		}
		if (user.email.toLowerCase() === newEmail) {
			throw new Error("This is already your email address");
		}

		const existingUser = await prisma.user.findFirst({
			where: { email: newEmail },
			select: { id: true },
		});
		if (existingUser) {
			return c.json(
				{ message: "An account with this email address already exists" },
				HttpStatus.CONFLICT.code,
			);
		}

		const code = generateUserVerificationCode();
		const token = generateUserVerificationToken();
		const codeHash = await hashUserVerificationCode(code);
		const userVerification = await prisma.userVerification.create({
			data: {
				email: newEmail,
				code: codeHash,
				token,
				numberOfFailedAttempts: 0,
				numberOfCodeTransfersViaEmail: 1,
				goal: UserVerificationGoals.emailChange,
				userId: authenticatedUser.id,
			},
			select: { id: true, token: true },
		});

		await sendMail({
			receiver: newEmail,
			subject: "Confirm your new email address",
			content: `Your validation code is ${code}`,
		});

		return c.json({ userVerification }, HttpStatus.OK.code);
	},
});

export { requestEmailChangeRoute };
