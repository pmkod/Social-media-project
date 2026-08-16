import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { getUserConnections } from "../services/get-user-connections.service";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/users/{userId}/followers",
	summary: "Get a user's followers with cursor pagination",
	tags: [UserRoutesTag],
	request: {
		params: z.object({ userId: z.string() }),
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("20"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "User followers" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const getUserFollowersRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const query = c.req.valid("query");
		const result = await getUserConnections({
			userId,
			type: "followers",
			cursorId: query.cursorId,
			cursorCreatedAt: query.cursorCreatedAt,
			limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 50),
		});

		if (!result) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		return c.json(result);
	},
});

export { getUserFollowersRoute };
