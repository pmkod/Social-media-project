import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import { sendMail } from "@/features/mail/mail.service";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
	AuthenticationRoutesTag,
	MAX_NUMBER_OF_USER_VERIFICATION_CODE_TRANSFER_BY_MAIL,
} from "../authentication.constants";
import { ResendUserVerificationCodeValidationSchema } from "../authentication.validation-schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const routeDef = createRoute({
	method: "post",
	path: "/resend-user-verification-code",
	summary: "Resend user verification code",
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
			description: "Success",
		},
	},
});

const resendUserVerificationCode = new OpenAPIHono().openapi(
	routeDef,
	async (c) => {
		const { userVerification } = c.req.valid("json");

		const userVerificatinInDb = await prisma.userVerification.findUnique({
			where: {
				id: userVerification.id,
				disabledAt: null,
				goalAchievedAt: null,
				verifiedAt: null,
			},
			select: {
				id: true,
				code: true,
				token: true,
				email: true,
				userId: true,
				numberOfCodeTransfersViaEmail: true,
			},
		});

		if (userVerificatinInDb === null) {
			throw Error("Sometthing went wrong");
		}

		if (userVerificatinInDb.token !== userVerification.token) {
			await prisma.userVerification.update({
				where: { id: userVerificatinInDb.id },
				data: {
					disabledAt: new Date(),
				},
			});
			throw Error("Sometthing went wrong");
		}

		if (
			userVerificatinInDb.numberOfCodeTransfersViaEmail >=
			MAX_NUMBER_OF_USER_VERIFICATION_CODE_TRANSFER_BY_MAIL
		) {
			throw Error("Sometthing went wrong");
		}

		let receiverEmail = userVerificatinInDb.email;

		if (receiverEmail === null) {
			if (userVerificatinInDb.userId !== null) {
				const user = await prisma.user.findUniqueOrThrow({
					where: { id: userVerificatinInDb.userId, active: true },
					select: { email: true },
				});
				receiverEmail = user.email;
			}
		}

		if (receiverEmail === null) {
			throw Error("");
		}

		await sendMail({
			receiver: receiverEmail,
			subject: "User verification",
			content: `Your validation code is ${userVerificatinInDb.code}`,
		});

		await prisma.userVerification.update({
			where: { id: userVerificatinInDb.id },
			data: {
				numberOfCodeTransfersViaEmail: { increment: 1 },
			},
		});

		return c.newResponse(null, 200);
	},
);

export { resendUserVerificationCode };
