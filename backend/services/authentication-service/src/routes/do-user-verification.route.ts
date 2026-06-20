import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import {
	AuthenticationRoutesTag,
	MAX_NUMBER_OF_USER_VERIFICATION_ATTEMPTS,
	USER_VERIFICATION_DURATION_IN_MINUTES,
} from "@/constants/authentication.constants";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/database";
import { AppError, ErrorCodes } from "@/errors/app-error";
import { DoUserVerificationValidationSchema } from "@/schemas/authentication.validation-schemas";
import { markVerificationAsVerified } from "@/services/user-verification.service";

const doUserVerificationRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/user-verification",
		summary: "User verification",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: DoUserVerificationValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Verification successful",
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

		const expirationDate = new Date(
			verification.createdAt.getTime() + USER_VERIFICATION_DURATION_IN_MINUTES * 60 * 1000,
		);
		if (expirationDate < new Date()) {
			await prisma.userVerification.update({
				where: { id: userVerification.id },
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
				where: { id: userVerification.id },
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
			return c.json(
				{
					success: false,
					error: {
						code: "VERIFICATION_INVALID",
						message: "Invalid verification code",
					},
				},
				400,
			);
		}

		await markVerificationAsVerified(verification.id);

		return c.newResponse(null, HttpStatus.OK.code);
	},
});

export { doUserVerificationRoute };
