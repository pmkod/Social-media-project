import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoEnv } from "@/core/types/hono-env";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/internal/user/get-active-user/{userId}",
	summary: "Get an active user by ID",
	tags: [UserRoutesTag],
	request: {
		params: z.object({ userId: z.string().nonempty() }),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Matched active user, or null if the user is inactive",
		},
	},
});

const getActiveUserRoute = defineOpenAPIRoute<typeof routeDef, HonoEnv>({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const user = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: {
				id: true,
				username: true,
				fullName: true,
				lowQualityProfilePictureFile: {
					select: { filename: true },
				},
				bestQualityProfilePictureFile: {
					select: { filename: true },
				},
			},
		});

		return c.json({ user });
	},
});

export { getActiveUserRoute };
