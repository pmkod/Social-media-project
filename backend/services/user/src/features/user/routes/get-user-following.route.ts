import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoEnv } from "@/core/types/hono-env";
import type { Prisma } from "@/generated/prisma/client";
import { UserRoutesTag } from "../user.constants";

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
			limit: z.coerce.number().positive().optional().default(20),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Users followed by the user" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const getUserFollowingRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const query = c.req.valid("query");

		const limit = query.limit;

		const userExists = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: { id: true },
		});

		if (!userExists) {
			throw Error("User not found");
		}

		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;

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
				...cursorCondition,
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			select: {
				id: true,
				createdAt: true,
				following: {
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
						createdAt: true,
					},
				},
			},
		});

		const hasNextPage = connections.length > limit;
		const items = hasNextPage ? connections.slice(0, limit) : connections;
		const lastItem = items.at(-1);
		const listedUserIds = items.map((connection) => connection.following.id);

		const idsOfUsersAuthenticatedUserFollow: string[] = [];

		if (listedUserIds.length > 0) {
			const follows = await prisma.follow.findMany({
				where: {
					followerId: authenticatedUserId,
					followingId: { in: listedUserIds },
				},
				select: { followingId: true },
			});
			idsOfUsersAuthenticatedUserFollow.push(
				...follows.map((follow) => follow.followingId),
			);
		}

		const usersToSend = items.map((connection) => ({
			...connection.following,
			isFollowedByAuthenticatedUser:
				idsOfUsersAuthenticatedUserFollow.length > 0
					? idsOfUsersAuthenticatedUserFollow.includes(connection.following.id)
					: false,
		}));

		return c.json({
			users: usersToSend,
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
