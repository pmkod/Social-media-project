import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import {
	comparePasswordToHash,
	hashPassword,
} from "@/features/authentication/authentication.functions";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";
import { ChangePasswordValidationSchema } from "../user.validation-schemas";

const routeDef = createRoute({
	method: "put",
	path: "/users/me/password",
	summary: "Change current user password",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": { schema: ChangePasswordValidationSchema },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Password updated successfully" },
	},
});

const changePasswordRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) {
			throw new Error("Unauthorized");
		}

		const { currentPassword, newPassword } = c.req.valid("json");
		const user = await prisma.user.findUnique({
			where: { id: authenticatedUser.id, active: true },
			select: { password: true },
		});

		if (!user) {
			throw new Error("User not found");
		}

		const isCurrentPasswordValid = await comparePasswordToHash({
			password: currentPassword,
			hash: user.password,
		});
		if (!isCurrentPasswordValid) {
			throw new Error("Current password is incorrect");
		}

		const passwordHash = await hashPassword(newPassword);
		await prisma.user.update({
			where: { id: authenticatedUser.id },
			data: { password: passwordHash },
		});

		return c.json({ success: true }, HttpStatus.OK.code);
	},
});

export { changePasswordRoute };
