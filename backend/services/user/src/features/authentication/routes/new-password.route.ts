import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import {
	AuthenticationRoutesTag,
	UserVerificationGoals,
} from "../authentication.constants";
import { NewPasswordValidationSchema } from "../authentication.validation-schemas";
import { hashPassword } from "../password.functions";
import { verifyIfUserVerificationCompleted } from "../user-verification.service";

const newPasswordRoute = defineOpenAPIRoute({
	route: createRoute({
		method: "post",
		path: "/authentication/new-password",
		summary: "Set new password after verification",
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
				description: "Password updated successfully",
			},
		},
	}),
	handler: async (c) => {
		const { userVerification, newPassword } = c.req.valid("json");

		const verificationInDb = await verifyIfUserVerificationCompleted({
			id: userVerification.id,
			token: userVerification.token,
			goal: UserVerificationGoals.passwordReset,
		});

		if (!verificationInDb.userId) {
			throw new Error("User ID missing from verification");
		}

		const hashedPassword = await hashPassword(newPassword);

		await prisma.user.update({
			where: { id: verificationInDb.userId },
			data: { password: hashedPassword },
		});

		await prisma.userVerification.update({
			where: { id: verificationInDb.id },
			data: { goalAchievedAt: new Date() },
		});

		return c.json({ success: true });
	},
});

export { newPasswordRoute };
