import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { sendMail } from "@/core/services/mail.service";
import {
	AuthenticationRoutesTag,
	MAXIMUM_NUMBER_OF_CODE_TRANSFERS_VIA_EMAIL,
} from "../authentication.constants";
import {
	generateUserVerificationCode,
	hashUserVerificationCode,
	isUserVerificationExpired,
} from "../authentication.functions";
import { ResendUserVerificationCodeValidationSchema } from "../authentication.validation-schemas";

const resendUserVerificationCodeRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/resend-user-verification-code",
		summary: "Resend verification code",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: ResendUserVerificationCodeValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Verification code resent",
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

		if (!verificationInDb || !verificationInDb.email) {
			throw new Error("Verification attempt not found or expired");
		}

		if (isUserVerificationExpired(verificationInDb)) {
			throw new Error("Verification attempt has expired");
		}

		if (
			verificationInDb.numberOfCodeTransfersViaEmail >=
			MAXIMUM_NUMBER_OF_CODE_TRANSFERS_VIA_EMAIL
		) {
			throw new Error(
				`Vous avez atteint le nombre maximal de renvois de code (${MAXIMUM_NUMBER_OF_CODE_TRANSFERS_VIA_EMAIL}).`,
			);
		}

		const newCode = generateUserVerificationCode();
		const newCodeHash = await hashUserVerificationCode(newCode);

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: {
				code: newCodeHash,
				numberOfCodeTransfersViaEmail: { increment: 1 },
			},
		});

		await sendMail({
			receiver: verificationInDb.email,
			subject: "User verification - New Code",
			content: `Your new validation code is ${newCode}`,
		});

		return c.json({ success: true });
	},
});

export { resendUserVerificationCodeRoute };
