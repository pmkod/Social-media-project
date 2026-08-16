import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/internal/users/{userId}/following-ids",
	summary: "Get followed user IDs for the content service",
	tags: [UserRoutesTag],
	request: { params: z.object({ userId: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "Followed user IDs" },
	},
});

const getFollowingIdsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const follows = await prisma.follow.findMany({
			where: { followerId: userId },
			select: { followingId: true },
		});
		return c.json({ userIds: follows.map((follow) => follow.followingId) });
	},
});

export { getFollowingIdsRoute };
