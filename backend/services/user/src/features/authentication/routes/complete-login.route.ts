import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { getRequestClientMetadata } from "@/core/functions/request.functions";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import { isUserVerificationExpired } from "../authentication.functions";
import {
	AuthenticatedResponseSchema,
	CompleteLoginValidationSchema,
} from "../authentication.validation-schemas";
import { createAuthenticatedResponse } from "../authentication-session.service";
import { verifyIfUserVerificationCompleted } from "../user-verification.service";

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
			throw new Error("Verification attempt has expired");
		}

		if (!verificationInDb.userId) {
			throw new Error("User ID missing from verification");
		}

		const user = await prisma.user.findUniqueOrThrow({
			where: { id: verificationInDb.userId, active: true },
		});

		const authenticatedResponse = await createAuthenticatedResponse({
			user,
			clientMetadata: getRequestClientMetadata(c),
		});

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: {
				goalAchievedAt: new Date(),
			},
		});

		return c.json(authenticatedResponse);
	},
});

export { completeLoginRoute };
