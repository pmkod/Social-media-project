import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoEnv } from "@/core/types/hono-env";
import type { Prisma } from "@/generated/prisma/client";
import { hydrateProfileMediaFiles } from "../services/get-profile-media-files.service";
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
			limit: z.coerce.number().positive().optional().default(20),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "User followers" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const getUserFollowersRoute = defineOpenAPIRoute<
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
							followerId: { lt: query.cursorId },
						},
					],
				}
			: undefined;

		const connections = await prisma.follow.findMany({
			where: {
				followingId: userId,
				...cursorCondition,
			},
			orderBy: [{ createdAt: "desc" }, { followerId: "desc" }],
			take: limit + 1,
			select: {
				followerId: true,
				createdAt: true,
				follower: {
					select: {
						id: true,
						username: true,
						fullName: true,
						lowQualityProfilePictureFileId: true,
						bestQualityProfilePictureFileId: true,
						createdAt: true,
					},
				},
			},
		});

		const hasNextPage = connections.length > limit;
		const items = hasNextPage ? connections.slice(0, limit) : connections;
		const lastItem = items.at(-1);
		const listedUserIds = items.map((connection) => connection.follower.id);
		const hydratedUsers = await hydrateProfileMediaFiles(
			items.map((connection) => connection.follower),
		);

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

		const usersToSend = hydratedUsers.map((user) => ({
			...user,
			isFollowedByAuthenticatedUser:
				idsOfUsersAuthenticatedUserFollow.length > 0
					? idsOfUsersAuthenticatedUserFollow.includes(user.id)
					: false,
		}));

		return c.json({
			users: usersToSend,
			pagination: {
				nextCursor:
					hasNextPage && lastItem
						? {
								id: lastItem.followerId,
								createdAt: lastItem.createdAt.toISOString(),
							}
						: null,
				hasNextPage,
				limit,
			},
		});
	},
});

export { getUserFollowersRoute };
