import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { AuthenticationRoutesTag } from "../authentication.constants";

// import type { HttpStatus } from "@/core/constants/http-status";
type Variables = {
	message: string;
};

const logoutRoute = new OpenAPIHono<HonoContextVariables>();

const routeDef = createRoute({
	method: "post",
	path: "/logout",
	summary: "Logout",
	tags: [AuthenticationRoutesTag],
	// request: {
	// 	body: {
	// 		content: {
	// 			"application/json": {
	// 				schema: LoginValidationSchema,
	// 			},
	// 		},
	// 	},
	// },
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

logoutRoute.openapi(routeDef, async (c) => {
	const loggedInUser = c.get("loggedInUser");
	if (!loggedInUser) {
		throw Error();
	}
	const refreshTokenId = loggedInUser.refreshTokenId;

	await prisma.refreshToken.update({
		where: { id: refreshTokenId, active: true },
		data: { active: false, disabledAt: new Date() },
	});

	return c.newResponse(null, 200);
});

export { logoutRoute };
