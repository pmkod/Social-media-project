import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { UserRoutesTag } from "../user.constants";
import { GetUserValidationSchema } from "../user.validation.schemas";

// import type { HttpStatus } from "@/core/constants/http-status";

const routeDef = createRoute({
	method: "get",
	path: "/:username",
	summary: "Get user by username",
	tags: [UserRoutesTag],
	request: {
		params: GetUserValidationSchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
	middleware: [controlUserAccess],
});

const getUserRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const { username } = c.req.valid("param");

		const user = await prisma.user.findUniqueOrThrow({
			where: {
				username,
				active: true,
			},
			select: {
				id: true,
				fullName: true,
				username: true,
				postCount: true,
				followCount: true,
				followerCount: true,
			},
		});

		return c.json({ user });
	},
);

export { getUserRoute };
