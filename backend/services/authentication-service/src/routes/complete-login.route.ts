import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { getUserById } from "@/clients/user-client";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "@/constants/authentication.constants";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/db";
import { AppError, ErrorCodes } from "@/errors/app-error";
import { createTokenPair } from "@/functions/tokens.functions";
import { CompleteLoginValidationSchema } from "@/schemas/authentication.validation-schemas";
import {
	markVerificationAsVerified,
	verifyIfUserVerificationCompleted,
} from "@/services/user-verification.service";

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

		const verification = await verifyIfUserVerificationCompleted({
			id: userVerification.id,
			token: userVerification.token,
			goal: UserVerificationGoals.login,
		});

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

		await markVerificationAsVerified(verification.id);
		await prisma.userVerification.update({
			where: { id: verification.id },
			data: { goalAchievedAt: new Date() },
		});

		const tokens = await createTokenPair(user.id);

		return c.json({ success: true, data: tokens }, HttpStatus.OK.code);
	},
});

export { completeLoginRoute };
