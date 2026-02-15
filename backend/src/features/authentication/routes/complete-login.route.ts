import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import { CompleteLoginValidationSchema } from "../authentication.validation-schemas";
import { generateAccessAndRefreshToken } from "../jwt.functions";

// import type { HttpStatus } from "@/core/constants/http-status";

const completeLoginRoute = new OpenAPIHono();

const routeDef = createRoute({
	method: "post",
	path: "/complete-login",
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
		},
	},
});

completeLoginRoute.openapi(routeDef, async (c) => {
	const { userVerification } = c.req.valid("json");

	const userVerificatinInDb = await prisma.userVerification.findUnique({
		where: {
			id: userVerification.id,
			disabledAt: null,
			goalAchievedAt: null,
			verifiedAt: { not: null },
			goal: UserVerificationGoals.login,
		},
		select: { id: true, token: true, userId: true },
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

	if (!userVerificatinInDb.userId) {
		throw Error("");
	}

	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userVerificatinInDb.userId },
		select: { id: true },
	});

	// const agent = req.headers["user-agent"];
	// const ip = req.ip;

	const refreshTokenInDb = await prisma.refreshToken.create({
		data: {
			active: true,
			userId: user.id,
			// ip,
			// agent,
		},
	});

	const { accessToken, refreshToken } = generateAccessAndRefreshToken({
		refreshTokenId: refreshTokenInDb.id,
		userId: user.id,
	});

	await prisma.userVerification.update({
		where: { id: userVerificatinInDb.id },
		data: {
			goalAchievedAt: new Date(),
		},
	});

	return c.json({
		accessToken,
		refreshToken,
	});
});

export { completeLoginRoute };
