import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { getBlockRelationships } from "../services/get-block-relationships.service";
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
	path: "/users/batch",
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

const getUsersBatchRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
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
				displayName: true,
				bio: true,
				avatarUrl: true,
				coverUrl: true,
				location: true,
				website: true,
				postCount: true,
				followersCount: true,
				followingCount: true,
				createdAt: true,
			},
		});
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;
		const blockRelationships = await getBlockRelationships(
			authenticatedUserId,
			users.map((user) => user.id),
		);

		return c.json(
			users.map((user) => ({
				...user,
				isOwnProfile: user.id === authenticatedUserId,
				isBlockedByAuthenticatedUser:
					blockRelationships.blockedByAuthenticatedUserIds.has(user.id),
				hasBlockedAuthenticatedInUser:
					blockRelationships.hasBlockedAuthenticatedUserIds.has(user.id),
			})),
		);
	},
});

export { getUsersBatchRoute };
