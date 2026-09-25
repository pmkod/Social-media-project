import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoEnv } from "@/core/types/hono-env";
import { getBlockRelationships } from "../services/get-block-relationships.service";
import { UserRoutesTag } from "../user.constants";

const CheckBlockRelationshipsRequestBody = z.object({
	userId: z.string().min(1),
	otherUserIds: z.array(z.string().min(1)).min(1),
});

const routeDef = createRoute({
	method: "post",
	path: "/internal/user/check-block-relationships",
	summary: "Check block relationships between a user and other users",
	tags: [UserRoutesTag],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CheckBlockRelationshipsRequestBody,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Block relationships grouped by direction",
		},
	},
});

const checkBlockRelationshipsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { userId, otherUserIds } = c.req.valid("json");
		const uniqueOtherUserIds = Array.from(
			new Set(otherUserIds.filter((otherUserId) => otherUserId !== userId)),
		);
		const relationships = await getBlockRelationships(
			userId,
			uniqueOtherUserIds,
		);

		return c.json({
			blockedUserIds: Array.from(
				relationships.blockedByAuthenticatedUserIds,
			),
			blockedByUserIds: Array.from(
				relationships.hasBlockedAuthenticatedUserIds,
			),
		});
	},
});

export { checkBlockRelationshipsRoute };
