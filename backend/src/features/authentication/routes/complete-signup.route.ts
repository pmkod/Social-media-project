import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import { CompleteSignupValidationSchema } from "../authentication.validation-schemas";
import { generateAccessAndRefreshToken } from "../jwt.functions";
import { hashPassword } from "../password.functions";

// import type { HttpStatus } from "@/core/constants/http-status";

const completeSignupRoute = new OpenAPIHono();

const routeDef = createRoute({
	method: "post",
	path: "/complete-signup",
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
		},
	},
});

completeSignupRoute.openapi(routeDef, async (c) => {
	const { userVerification, fullName, username, password } =
		c.req.valid("json");

	// console.log(userVerification);

	const userVerificatinInDb = await prisma.userVerification.findUnique({
		where: {
			id: userVerification.id,
			disabledAt: null,
			goalAchievedAt: null,
			verifiedAt: { not: null },
			goal: UserVerificationGoals.signup,
		},
		select: {
			id: true,
			code: true,
			token: true,
			email: true,
			password: true,
			numberOfCodeTransfersViaEmail: true,
			user: true,
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
	if (!userVerificatinInDb.email) {
		throw Error();
	}

	const passwordHash = hashPassword(password);

	const user = await prisma.user.create({
		data: {
			fullName: fullName,
			username: username,
			email: userVerificatinInDb.email,
			password: passwordHash,
			active: true,
		},
	});

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

export { completeSignupRoute };
