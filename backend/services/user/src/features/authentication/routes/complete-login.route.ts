import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import { CompleteLoginValidationSchema } from "../authentication.validation-schemas";
import { generateAccessToken } from "../jwt.functions";
import {
	generateRefreshTokenString,
	hashRefreshToken,
} from "../refresh-token.functions";
import { verifyIfUserVerificationCompleted } from "../user-verification.service";

const CompleteLoginResponseBody = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	user: z.object({
		id: z.string(),
		email: z.string(),
		username: z.string(),
		fullName: z.string().nullable(),
	}),
});

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
					"application/json": { schema: CompleteLoginResponseBody },
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

		if (!verificationInDb.userId) {
			throw new Error("User ID missing from verification");
		}

		const user = await prisma.user.findUniqueOrThrow({
			where: { id: verificationInDb.userId, active: true },
		});

		const rawRefreshToken = generateRefreshTokenString();
		const refreshTokenInDb = await prisma.refreshToken.create({
			data: {
				active: true,
				userId: user.id,
				token: hashRefreshToken(rawRefreshToken),
			},
		});

		const accessToken = generateAccessToken({
			refreshTokenId: refreshTokenInDb.id,
			userId: user.id,
		});

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: {
				goalAchievedAt: new Date(),
			},
		});

		return c.json({
			accessToken,
			refreshToken: rawRefreshToken,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				fullName: user.fullName,
			},
		});
	},
});

export { completeLoginRoute };
