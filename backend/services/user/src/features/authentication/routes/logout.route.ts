import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { AuthenticationRoutesTag } from "../authentication.constants";
import { requireUserAuthentication } from "../middlewares/require-user-authentication.middleware";

const logoutRoute = defineOpenAPIRoute<typeof routeDef, HonoAuthenticatedEnv>({
	route: createRoute({
		method: "post",
		path: "/authentication/logout",
		summary: "Logout user",
		tags: [AuthenticationRoutesTag],
		middleware: [requireUserAuthentication],
		responses: {
			[HttpStatus.OK.code]: {
				description: "Logged out successfully",
			},
		},
	}),
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) {
			throw new Error("Unauthorized");
		}

		await prisma.refreshToken.updateMany({
			where: { userId: authenticatedUser.id, active: true },
			data: { active: false, disabledAt: new Date() },
		});

		return c.json({ success: true });
	},
});

const routeDef = createRoute({
	method: "post",
	path: "/authentication/logout",
	summary: "Logout user",
	tags: [AuthenticationRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.OK.code]: {
			description: "Logged out successfully",
		},
	},
});

export { logoutRoute };
