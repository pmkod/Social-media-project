import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import { CompleteSignupValidationSchema } from "../authentication.validation-schemas";
import { generateAccessToken } from "../jwt.functions";
import {
	generateRefreshTokenString,
	hashRefreshToken,
} from "../refresh-token.functions";
import { verifyIfUserVerificationCompleted } from "../user-verification.service";

const CompleteSignupResponseBody = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	user: z.object({
		id: z.string(),
		email: z.string(),
		username: z.string(),
		fullName: z.string().nullable(),
	}),
});

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
					"application/json": { schema: CompleteSignupResponseBody },
				},
			},
		},
	}),
	handler: async (c) => {
		const { userVerification } = c.req.valid("json");

		const verificationInDb = await verifyIfUserVerificationCompleted({
			id: userVerification.id,
			token: userVerification.token,
			goal: UserVerificationGoals.signup,
		});

		if (!verificationInDb.email || !verificationInDb.username || !verificationInDb.password) {
			throw new Error("Invalid verification data");
		}

		const user = await prisma.user.create({
			data: {
				email: verificationInDb.email,
				username: verificationInDb.username,
				fullName: verificationInDb.fullName,
				password: verificationInDb.password,
				emailVerified: true,
			},
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
				userId: user.id,
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

export { completeSignupRoute };
