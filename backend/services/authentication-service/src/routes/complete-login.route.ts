import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { getUserById } from "@/clients/user-client";
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
import { CompleteLoginValidationSchema } from "@/schemas/authentication.validation-schemas";

const completeLoginRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/complete-login",
		summary: "Complete login",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: CompleteLoginValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Login completed",
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

		if (verification.goal !== UserVerificationGoals.login) {
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

		if (!verification.userId) {
			throw new AppError({
				message: "Invalid verification",
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

		const user = await getUserById(verification.userId);

		if (!user.active) {
			throw new AppError({
				message: "User not found",
				code: ErrorCodes.NOT_FOUND,
				statusCode: 404,
			});
		}

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

export { completeLoginRoute };
