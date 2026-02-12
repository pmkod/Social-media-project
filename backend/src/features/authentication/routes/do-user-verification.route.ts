import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { AuthenticationRoutesTag } from "../authentication.constants";
import { DoUserVerificationValidationSchema } from "../authentication.validation-schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const doUserVerificationRoute = new OpenAPIHono();

const routeDef = createRoute({
	method: "post",
	path: "/user-verification",
	summary: "User verification",
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
			description: "Success",
		},
	},
});

doUserVerificationRoute.openapi(routeDef, async (c) => {
	const { userVerification } = c.req.valid("json");

	const userVerificatinInDb = await prisma.userVerification.findUnique({
		where: {
			id: userVerification.id,
			disabledAt: null,
			verifiedAt: null,
			goalAchievedAt: null,
		},
		select: { id: true, code: true, token: true, numberOfFailedAttempts: true },
	});

	if (userVerificatinInDb === null) {
		throw Error("Sometthing went wrong");
	}

	if (userVerificatinInDb.token !== userVerification.token) {
		await prisma.userVerification.update({
			where: { id: userVerificatinInDb.id },
			data: {
				disabledAt: new Date(),
				numberOfFailedAttempts: { increment: 1 },
			},
		});
		throw Error("Sometthing went wrong");
	}
	if (userVerificatinInDb.code !== userVerification.code) {
		await prisma.userVerification.update({
			where: { id: userVerificatinInDb.id },
			data: {
				numberOfFailedAttempts: { increment: 1 },
			},
		});
		throw Error("Code incorrecte");
	}
	await prisma.userVerification.update({
		where: { id: userVerificatinInDb.id },
		data: {
			verifiedAt: new Date(),
		},
	});
	//
	return c.newResponse(null, 200);
});

export { doUserVerificationRoute };
