import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import {
	AuthenticationRoutesTag,
	MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS,
} from "../authentication.constants";
import { DoUserVerificationValidationSchema } from "../authentication.validation-schemas";

const doUserVerificationRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/user-verification",
		summary: "Validate 6-digit verification code",
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
				description: "Verification code validated successfully",
			},
		},
	}),
	handler: async (c) => {
		const { userVerification } = c.req.valid("json");

		const verificationInDb = await prisma.userVerification.findFirst({
			where: {
				id: userVerification.id,
				token: userVerification.token,
				disabledAt: null,
			},
		});

		if (!verificationInDb) {
			throw new Error("Verification attempt not found or expired");
		}

		if (
			verificationInDb.numberOfFailedAttempts >=
			MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS
		) {
			await prisma.userVerification.update({
				where: { id: verificationInDb.id },
				data: { disabledAt: new Date() },
			});
			throw new Error(
				`Vous avez atteint le nombre maximal de tentatives (${MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS}).`,
			);
		}

		if (verificationInDb.code !== userVerification.code) {
			await prisma.userVerification.update({
				where: { id: verificationInDb.id },
				data: { numberOfFailedAttempts: { increment: 1 } },
			});
			throw new Error("Invalid verification code. Please try again.");
		}

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: { verifiedAt: new Date() },
		});

		return c.json({ success: true });
	},
});

export { doUserVerificationRoute };
