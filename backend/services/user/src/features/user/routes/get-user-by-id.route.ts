import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/users/{userId}",
	summary: "Get user by ID",
	tags: [UserRoutesTag],
	request: {
		params: z.object({
			userId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const getUserByIdRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");

		const user = await prisma.user.findUnique({
			where: { id: userId, active: true },
			select: {
				id: true,
				username: true,
				fullName: true,
				displayName: true,
				bio: true,
				avatarUrl: true,
				location: true,
				website: true,
				createdAt: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return c.json(user);
	},
});

export { getUserByIdRoute };
