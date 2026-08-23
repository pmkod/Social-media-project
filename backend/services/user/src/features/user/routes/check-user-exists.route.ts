import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/internal/users/{userId}/exists",
	summary:
		"Check that an active user can be used as an internal service target",
	tags: [UserRoutesTag],
	request: {
		params: z.object({ userId: z.string() }),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "User exists" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const checkUserExistsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const user = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: { id: true },
		});

		if (!user) {
			return c.json({ exists: false }, HttpStatus.NOT_FOUND.code);
		}

		return c.json({ exists: true });
	},
});

export { checkUserExistsRoute };
