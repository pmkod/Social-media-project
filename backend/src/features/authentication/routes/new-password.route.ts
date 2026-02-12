import { HttpStatus } from "@/core/constants/http-status";
import { USER_ROLES } from "@/features/user/user-roles.constants";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../../core/databases/postgresql";
import {
	AuthenticationRoutesTag,
	USER_VERIFICATION_GOALS,
} from "../authentication.constants";
import { NewPasswordValidationSchema } from "../authentication.validation-schemas";
import { generateAccessAndRefreshToken } from "../jwt.functions";
import { hashPassword } from "../password.functions";

// import type { HttpStatus } from "@/core/constants/http-status";

const newPasswordRoute = new OpenAPIHono();

const routeDef = createRoute({
	method: "post",
	path: "/new-password",
	summary: "New password",
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
			description: "Success",
		},
	},
});

newPasswordRoute.openapi(routeDef, async (c) => {
	const { newPassword, userVerification } = c.req.valid("json");

	const userVerificatinInDb = await prisma.userVerification.findUniqueOrThrow({
		where: {
			id: userVerification.id,
			disabledAt: null,
			goalAchievedAt: null,
			verifiedAt: { not: null },
			goal: USER_VERIFICATION_GOALS.passwordReset,
		},
		select: { id: true, code: true, token: true, userId: true },
	});

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
		throw Error("Something went wrong");
	}

	const hash = hashPassword(newPassword);

	const user = await prisma.user.update({
		where: { id: userVerificatinInDb.userId },
		data: {
			password: hash,
		},
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
		userRole: USER_ROLES.customer,
	});

	await prisma.userVerification.update({
		where: { id: userVerificatinInDb.id },
		data: {
			goalAchievedAt: new Date(),
		},
	});

	return c.json({ accessToken, refreshToken });
});

export { newPasswordRoute };
