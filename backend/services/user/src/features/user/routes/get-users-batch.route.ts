import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoEnv } from "@/core/types/hono-env";
import { UserRoutesTag } from "../user.constants";

const GetUsersBatchRequestBody = z.object({
	userIds: z
		.array(z.string())
		.min(1, "At least one user ID is required")
		.openapi({
			example: ["user-123", "user-456"],
			description: "List of user IDs to retrieve",
		}),
});

const routeDef = createRoute({
	method: "post",
	path: "/internal/user/get-users-batch",
	summary: "Get multiple users by their IDs in batch",
	tags: [UserRoutesTag],
	request: {
		body: {
			content: {
				"application/json": {
					schema: GetUsersBatchRequestBody,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "List of matched active users",
		},
	},
});

const getUsersBatchRoute = defineOpenAPIRoute<typeof routeDef, HonoEnv>({
	route: routeDef,
	handler: async (c) => {
		const { userIds } = c.req.valid("json");
		const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));

		if (uniqueIds.length === 0) {
			return c.json([]);
		}

		const users = await prisma.user.findMany({
			where: {
				id: { in: uniqueIds },
				active: true,
			},
			select: {
				id: true,
				username: true,
				fullName: true,
				lowQualityProfilePictureFile: {
					select: { id: true, filename: true },
				},
				bestQualityProfilePictureFile: {
					select: { id: true, filename: true },
				},
			},
		});

		return c.json(users);
	},
});

export { getUsersBatchRoute };
