import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { AuthenticationRoutesTag } from "../authentication.constants";
import { RefreshTokenValidationSchema } from "../authentication.validation-schemas";
import { generateAccessToken } from "../jwt.functions";
import {
	generateRefreshTokenString,
	hashRefreshToken,
} from "../refresh-token.functions";

const RefreshTokenResponseBody = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
});

const refreshTokenRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/refresh-token",
		summary: "Refresh access token",
		tags: [AuthenticationRoutesTag],
		request: {
			body: {
				content: {
					"application/json": {
						schema: RefreshTokenValidationSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatus.OK.code]: {
				description: "Success",
				content: {
					"application/json": { schema: RefreshTokenResponseBody },
				},
			},
		},
	}),
	handler: async (c) => {
		const { refreshToken } = c.req.valid("json");
		const hashedToken = hashRefreshToken(refreshToken);

		const refreshTokenInDb = await prisma.refreshToken.findUnique({
			where: { token: hashedToken, active: true },
		});

		if (!refreshTokenInDb || !refreshTokenInDb.userId) {
			throw new Error("Invalid or inactive refresh token");
		}

		await prisma.refreshToken.update({
			where: { id: refreshTokenInDb.id },
			data: { active: false, disabledAt: new Date() },
		});

		const newRawRefreshToken = generateRefreshTokenString();
		const newRefreshTokenInDb = await prisma.refreshToken.create({
			data: {
				active: true,
				userId: refreshTokenInDb.userId,
				token: hashRefreshToken(newRawRefreshToken),
			},
		});

		const accessToken = generateAccessToken({
			refreshTokenId: newRefreshTokenInDb.id,
			userId: refreshTokenInDb.userId,
		});

		return c.json({
			accessToken,
			refreshToken: newRawRefreshToken,
		});
	},
});

export { refreshTokenRoute };
