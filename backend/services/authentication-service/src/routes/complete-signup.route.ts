import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { createUser, getUserByUsername } from "@/clients/user-client";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "@/constants/authentication.constants";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/db";
import { AppError, ErrorCodes } from "@/errors/app-error";
import { createTokenPair } from "@/functions/tokens.functions";
import { CompleteSignupValidationSchema } from "@/schemas/authentication.validation-schemas";
import {
	markVerificationAsVerified,
	verifyIfUserVerificationCompleted,
} from "@/services/user-verification.service";

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

		const verification = await verifyIfUserVerificationCompleted({
			id: userVerification.id,
			token: userVerification.token,
			goal: UserVerificationGoals.signup,
		});

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

		await markVerificationAsVerified(verification.id);
		await prisma.userVerification.update({
			where: { id: verification.id },
			data: { goalAchievedAt: new Date() },
		});

		const tokens = await createTokenPair(user.id);

		return c.json({ success: true, data: tokens }, HttpStatus.OK.code);
	},
});

export { completeSignupRoute };
