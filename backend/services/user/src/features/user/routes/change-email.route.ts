import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { UserVerificationGoals } from "@/features/authentication/authentication.constants";
import { isUserVerificationExpired } from "@/features/authentication/authentication.functions";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { verifyIfUserVerificationCompleted } from "@/features/authentication/user-verification.service";
import { UserRoutesTag } from "../user.constants";
import { CompleteEmailChangeValidationSchema } from "../user.validation-schemas";

const routeDef = createRoute({
	method: "put",
	path: "/users/me/email",
	summary: "Change current user email after verification",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": { schema: CompleteEmailChangeValidationSchema },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Email updated successfully" },
		[HttpStatus.CONFLICT.code]: { description: "Email already in use" },
	},
});

const changeEmailRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");

		const { userVerification } = c.req.valid("json");
		const verificationInDb = await verifyIfUserVerificationCompleted({
			id: userVerification.id,
			token: userVerification.token,
			goal: UserVerificationGoals.emailChange,
		});

		if (isUserVerificationExpired(verificationInDb)) {
			throw new Error("Verification attempt has expired");
		}
		if (
			verificationInDb.userId !== authenticatedUser.id ||
			!verificationInDb.email
		) {
			throw new Error("Invalid verification data");
		}
		if (verificationInDb.goalAchievedAt) {
			throw new Error("This verification has already been used");
		}

		const existingUser = await prisma.user.findFirst({
			where: {
				email: verificationInDb.email,
				NOT: { id: authenticatedUser.id },
			},
			select: { id: true },
		});
		if (existingUser) {
			return c.json(
				{ message: "An account with this email address already exists" },
				HttpStatus.CONFLICT.code,
			);
		}

		const user = await prisma.user.update({
			where: { id: authenticatedUser.id },
			data: {
				email: verificationInDb.email,
			},
			select: { email: true },
		});

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: { goalAchievedAt: new Date() },
		});

		return c.json(
			{ message: "Email updated successfully", email: user.email },
			HttpStatus.OK.code,
		);
	},
});

export { changeEmailRoute };
