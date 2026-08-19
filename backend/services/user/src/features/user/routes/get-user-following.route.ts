import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { Prisma } from "@/generated/prisma/client";
import { getBlockRelationships } from "../services/get-block-relationships.service";
import { getFollowedUserIds } from "../services/get-followed-user-ids.service";
import { UserRoutesTag } from "../user.constants";

const connectionUserSelect = {
	id: true,
	username: true,
	fullName: true,
	displayName: true,
	bio: true,
	avatarUrl: true,
	followersCount: true,
	followingCount: true,
	createdAt: true,
} satisfies Prisma.UserSelect;

const routeDef = createRoute({
	method: "get",
	path: "/users/{userId}/following",
	summary: "Get users followed by a user with cursor pagination",
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
		[HttpStatus.OK.code]: { description: "Users followed by the user" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const getUserFollowingRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 20, 1),
			50,
		);
		const userExists = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: { id: true },
		});

		if (!userExists) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}
		const authenticatedUserId = c.req.header("X-Authenticated-User-Id");
		const profileBlockRelationships = await getBlockRelationships(
			authenticatedUserId,
			[userId],
		);
		if (
			profileBlockRelationships.blockedByAuthenticatedUserIds.has(userId) ||
			profileBlockRelationships.hasBlockedAuthenticatedUserIds.has(userId)
		) {
			return c.json({
				users: [],
				pagination: { nextCursor: null, hasNextPage: false, limit },
			});
		}

		const cursorDate = query.cursorCreatedAt
			? new Date(query.cursorCreatedAt)
			: null;
		const hasValidCursor =
			cursorDate !== null &&
			!Number.isNaN(cursorDate.getTime()) &&
			query.cursorId;
		const cursorCondition: Prisma.FollowWhereInput | undefined = hasValidCursor
			? {
					OR: [
						{ createdAt: { lt: cursorDate } },
						{
							createdAt: cursorDate,
							id: { lt: query.cursorId },
						},
					],
				}
			: undefined;

		const connections = await prisma.follow.findMany({
			where: {
				followerId: userId,
				following: { active: true },
				...cursorCondition,
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			select: {
				id: true,
				createdAt: true,
				following: { select: connectionUserSelect },
			},
		});

		const hasNextPage = connections.length > limit;
		const items = hasNextPage ? connections.slice(0, limit) : connections;
		const lastItem = items.at(-1);
		const listedUserIds = items.map((connection) => connection.following.id);
		const [followedUserIds, blockRelationships] = await Promise.all([
			getFollowedUserIds(authenticatedUserId, listedUserIds),
			getBlockRelationships(authenticatedUserId, listedUserIds),
		]);

		return c.json({
			users: items.map((connection) => ({
				...connection.following,
				isOwnProfile: connection.following.id === authenticatedUserId,
				isFollowedByAuthenticatedUser: followedUserIds.has(
					connection.following.id,
				),
				isBlockedByAuthenticatedUser:
					blockRelationships.blockedByAuthenticatedUserIds.has(
						connection.following.id,
					),
				hasBlockedAuthenticatedInUser:
					blockRelationships.hasBlockedAuthenticatedUserIds.has(
						connection.following.id,
					),
			})),
			pagination: {
				nextCursor:
					hasNextPage && lastItem
						? {
								id: lastItem.id,
								createdAt: lastItem.createdAt.toISOString(),
							}
						: null,
				hasNextPage,
				limit,
			},
		});
	},
});

export { getUserFollowingRoute };
