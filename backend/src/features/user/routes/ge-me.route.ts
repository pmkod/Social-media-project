import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { UserRoutesTag } from "../user.constants";

// import type { HttpStatus } from "@/core/constants/http-status";

const routeDef = createRoute({
	method: "get",
	path: "/me",
	summary: "Get me",
	tags: [UserRoutesTag],
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const getMeRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const loggedInUser = c.get("loggedInUser");
		if (!loggedInUser) {
			throw Error();
		}

		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id: loggedInUser.id,
				active: true,
			},
			select: {
				id: true,
				fullName: true,
				username: true,
			},
		});

		console.log(user);

		return c.json({ user });
	},
);

export { getMeRoute };
