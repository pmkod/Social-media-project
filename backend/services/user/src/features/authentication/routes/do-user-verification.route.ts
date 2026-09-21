import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import {
	AuthenticationRoutesTag,
	MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS,
} from "../authentication.constants";
import {
	compareUserVerificationCodeToHash,
	isUserVerificationExpired,
} from "../authentication.functions";
import { DoUserVerificationValidationSchema } from "../authentication.validation-schemas";

const doUserVerificationRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/user/do-user-verification",
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
			throw new Exception({
				code: ExceptionCodes.verification_not_found_or_expired,
				message: "Verification attempt not found or expired",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		if (isUserVerificationExpired(verificationInDb)) {
			throw new Exception({
				code: ExceptionCodes.verification_expired,
				message: "Verification attempt has expired",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		if (
			verificationInDb.numberOfFailedAttempts >=
			MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS
		) {
			await prisma.userVerification.update({
				where: { id: verificationInDb.id },
				data: { disabledAt: new Date() },
			});
			throw new Exception({
				code: ExceptionCodes.verification_attempts_limit_reached,
				message: `Vous avez atteint le nombre maximal de tentatives (${MAXIMUM_NUMBER_OF_FAILED_ATTEMPTS}).`,
				status: HttpStatus.TOO_MANY_REQUESTS.code,
			});
		}

		const isCodeValid = await compareUserVerificationCodeToHash({
			code: userVerification.code,
			hash: verificationInDb.code ?? "",
		});

		if (!isCodeValid) {
			await prisma.userVerification.update({
				where: { id: verificationInDb.id },
				data: { numberOfFailedAttempts: { increment: 1 } },
			});
			throw new Exception({
				code: ExceptionCodes.invalid_verification_code,
				message: "Invalid verification code. Please try again.",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: { verifiedAt: new Date() },
		});

		return c.json({ message: "User verified successfully" });
	},
});

export { doUserVerificationRoute };
