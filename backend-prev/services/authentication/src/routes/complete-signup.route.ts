import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { createUser, getUserByUsername } from "@/clients/user-client";
import {
	AuthenticationRoutesTag,
	MAX_NUMBER_OF_USER_VERIFICATION_ATTEMPTS,
	USER_VERIFICATION_DURATION_IN_MINUTES,
	UserVerificationGoals,
} from "@/constants/authentication.constants";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/database";
import { AppError, ErrorCodes } from "@/errors/app-error";
import { createTokenPair } from "@/functions/tokens.functions";
import { CompleteSignupValidationSchema } from "@/schemas/authentication.validation-schemas";

const completeSignupRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/complete-signup",
		summary: "Complete signup",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: CompleteSignupValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Signup completed",
			},
		},
	}),
	handler: async (c) => {
		const body = c.req.valid("json");
		const { userVerification } = body;

		const verification = await prisma.userVerification.findFirst({
			where: { id: userVerification.id },
		});

		if (!verification) {
			throw new AppError({
				message: "Verification not found",
				code: ErrorCodes.NOT_FOUND,
				statusCode: 404,
			});
		}

		if (
			verification.disabledAt !== null ||
			verification.verifiedAt !== null ||
			verification.goalAchievedAt !== null
		) {
			throw new AppError({
				message: "Verification is no longer valid",
				code: ErrorCodes.VERIFICATION_INVALID,
				statusCode: 400,
			});
		}

		if (verification.goal !== UserVerificationGoals.signup) {
			throw new AppError({
				message: "Invalid verification goal",
				code: ErrorCodes.VERIFICATION_INVALID,
				statusCode: 400,
			});
		}

		const expirationDate = new Date(
			verification.createdAt.getTime() + USER_VERIFICATION_DURATION_IN_MINUTES * 60 * 1000,
		);
		if (expirationDate < new Date()) {
			await prisma.userVerification.update({
				where: { id: verification.id },
				data: { disabledAt: new Date() },
			});
			throw new AppError({
				message: "Verification code expired",
				code: ErrorCodes.VERIFICATION_EXPIRED,
				statusCode: 400,
			});
		}

		if (verification.token !== userVerification.token) {
			await prisma.userVerification.update({
				where: { id: verification.id },
				data: { disabledAt: new Date() },
			});
			throw new AppError({
				message: "Invalid verification token",
				code: ErrorCodes.VERIFICATION_INVALID,
				statusCode: 400,
			});
		}

		if (verification.numberOfFailedAttempts >= MAX_NUMBER_OF_USER_VERIFICATION_ATTEMPTS) {
			throw new AppError({
				message: "Too many failed attempts",
				code: ErrorCodes.VERIFICATION_INVALID,
				statusCode: 400,
			});
		}

		if (verification.code !== userVerification.code) {
			await prisma.userVerification.update({
				where: { id: verification.id },
				data: { numberOfFailedAttempts: verification.numberOfFailedAttempts + 1 },
			});

			throw new AppError({
				message: "Invalid verification code",
				code: ErrorCodes.VERIFICATION_INVALID,
				statusCode: 400,
			});
		}

		if (!verification.fullName || !verification.passwordHash) {
			throw new AppError({
				message: "Signup data missing",
				code: ErrorCodes.INTERNAL_ERROR,
				statusCode: 500,
			});
		}

		const existingUsername = await getUserByUsername(body.username);

		if (existingUsername) {
			throw new AppError({
				message: "Username already taken",
				code: ErrorCodes.CONFLICT,
				statusCode: 409,
			});
		}

		const user = await createUser({
			email: verification.email,
			username: body.username,
			passwordHash: verification.passwordHash,
			fullName: verification.fullName,
		});

		await prisma.userVerification.update({
			where: { id: verification.id },
			data: { verifiedAt: new Date() },
		});
		await prisma.userVerification.update({
			where: { id: verification.id },
			data: { goalAchievedAt: new Date() },
		});

		const tokens = await createTokenPair(user.id);

		return c.json({ success: true, data: tokens }, HttpStatus.OK.code);
	},
});

export { completeSignupRoute };
