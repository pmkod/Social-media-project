import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/internal/users/{userId}/block-relationship-ids",
	summary: "Get block relationship IDs for internal services",
	tags: [UserRoutesTag],
	request: { params: z.object({ userId: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "Block relationship IDs" },
	},
});

const getBlockRelationshipIdsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const blocks = await prisma.block.findMany({
			where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
			select: { blockerId: true, blockedId: true },
		});

		return c.json({
			blockedUserIds: blocks
				.filter((block) => block.blockerId === userId)
				.map((block) => block.blockedId),
			blockedByUserIds: blocks
				.filter((block) => block.blockedId === userId)
				.map((block) => block.blockerId),
		});
	},
});

export { getBlockRelationshipIdsRoute };
