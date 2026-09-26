import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import { getRequestClientMetadata } from "@/core/functions/request.functions";
import { sessionServiceClient } from "@/core/service-clients/session-service.client";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import { isUserVerificationExpired } from "../authentication.functions";
import {
	AuthenticatedResponseSchema,
	CompleteSignupValidationSchema,
} from "../authentication.validation-schemas";
import { verifyIfUserVerificationCompleted } from "../user-verification.service";

const completeSignupRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/user/complete-signup",
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
				description: "Success",
				content: {
					"application/json": { schema: AuthenticatedResponseSchema },
				},
			},
		},
	}),
	handler: async (c) => {
		const { userVerification, username } = c.req.valid("json");

		const verificationInDb = await verifyIfUserVerificationCompleted({
			id: userVerification.id,
			token: userVerification.token,
			goal: UserVerificationGoals.signup,
		});

		if (isUserVerificationExpired(verificationInDb)) {
			throw new Exception({
				code: ExceptionCodes.verification_expired,
				message: "Verification attempt has expired",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		if (!verificationInDb.email || !verificationInDb.password) {
			throw new Exception({
				code: ExceptionCodes.invalid_verification_data,
				message: "Invalid verification data",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		const existingUsernameUser = await prisma.user.findFirst({
			where: { username },
		});
		if (existingUsernameUser !== null) {
			throw new Exception({
				code: ExceptionCodes.username_already_exists,
				message: "An account with this username already exists",
				status: HttpStatus.CONFLICT.code,
			});
		}

		const user = await prisma.user.create({
			data: {
				email: verificationInDb.email,
				username,
				fullName: verificationInDb.fullName,
				password: verificationInDb.password,
			},
		});
		const { ipAddress, userAgent } = getRequestClientMetadata(c);

		const session = await sessionServiceClient.createSession({
			userId: user.id,
			ipAddress,
			userAgent,
		});

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: {
				goalAchievedAt: new Date(),
				userId: user.id,
			},
		});

		return c.json({ session });
	},
});

export { completeSignupRoute };
