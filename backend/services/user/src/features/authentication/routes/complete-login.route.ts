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
	CompleteLoginValidationSchema,
} from "../authentication.validation-schemas";
import { verifyIfUserVerificationCompleted } from "../user-verification.service";

const completeLoginRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/user/complete-login",
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
				description: "Success",
				content: {
					"application/json": { schema: AuthenticatedResponseSchema },
				},
			},
		},
	}),
	handler: async (c) => {
		const { userVerification } = c.req.valid("json");

		const verificationInDb = await verifyIfUserVerificationCompleted({
			id: userVerification.id,
			token: userVerification.token,
			goal: UserVerificationGoals.login,
		});

		if (isUserVerificationExpired(verificationInDb)) {
			throw new Exception({
				code: ExceptionCodes.verification_expired,
				message: "Verification attempt has expired",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		if (!verificationInDb.userId) {
			throw new Exception({
				message: "User ID missing from verification",
				status: HttpStatus.INTERNAL_SERVER_ERROR.code,
			});
		}

		const user = await prisma.user.findUniqueOrThrow({
			where: { id: verificationInDb.userId, active: true },
		});

		const session = await sessionServiceClient.createSession({
			userId: user.id,
			...getRequestClientMetadata(c),
		});

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: {
				goalAchievedAt: new Date(),
			},
		});

		return c.json({ session });
	},
});

export { completeLoginRoute };
