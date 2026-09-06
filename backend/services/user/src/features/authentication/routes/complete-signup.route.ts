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
	CompleteSignupValidationSchema,
} from "../authentication.validation-schemas";
import { createAuthenticatedResponse } from "../authentication-session.service";
import { verifyIfUserVerificationCompleted } from "../user-verification.service";

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
			throw new Error("Verification attempt has expired");
		}

		if (!verificationInDb.email || !verificationInDb.password) {
			throw new Error("Invalid verification data");
		}

		const existingUsernameUser = await prisma.user.findFirst({
			where: { username },
		});
		if (existingUsernameUser !== null) {
			throw new Error("An account with this username already exists");
		}

		const user = await prisma.user.create({
			data: {
				email: verificationInDb.email,
				username,
				fullName: verificationInDb.fullName,
				password: verificationInDb.password,
				emailVerified: true,
			},
		});

		const authenticatedResponse = await createAuthenticatedResponse({
			user,
			clientMetadata: getRequestClientMetadata(c),
		});

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: {
				goalAchievedAt: new Date(),
				userId: user.id,
			},
		});

		return c.json(authenticatedResponse);
	},
});

export { completeSignupRoute };
