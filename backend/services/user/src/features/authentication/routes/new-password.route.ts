import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { getRequestClientMetadata } from "@/core/functions/request.functions";
import { sessionServiceClient } from "@/core/services/session-service.client";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import {
	hashPassword,
	isUserVerificationExpired,
} from "../authentication.functions";
import {
	AuthenticatedResponseSchema,
	NewPasswordValidationSchema,
} from "../authentication.validation-schemas";
import { verifyIfUserVerificationCompleted } from "../user-verification.service";

const newPasswordRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/new-password",
		summary: "Set new password after verification",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: NewPasswordValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Password updated successfully",
				content: {
					"application/json": { schema: AuthenticatedResponseSchema },
				},
			},
		},
	}),
	handler: async (c) => {
		const { userVerification, newPassword } = c.req.valid("json");

		const verificationInDb = await verifyIfUserVerificationCompleted({
			id: userVerification.id,
			token: userVerification.token,
			goal: UserVerificationGoals.passwordReset,
		});

		if (isUserVerificationExpired(verificationInDb)) {
			throw new Error("Verification attempt has expired");
		}

		if (!verificationInDb.userId) {
			throw new Error("User ID missing from verification");
		}

		const hashedPassword = await hashPassword(newPassword);

		const user = await prisma.user.update({
			where: { id: verificationInDb.userId },
			data: { password: hashedPassword },
		});

		const session = await sessionServiceClient.createSession({
			userId: user.id,
			...getRequestClientMetadata(c),
		});

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: { goalAchievedAt: new Date() },
		});

		return c.json({ session });
	},
});

export { newPasswordRoute };
