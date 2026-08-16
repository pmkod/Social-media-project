import { prisma } from "@/core/databases";
import type { Prisma } from "@/generated/prisma/client";

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

type UserConnectionType = "followers" | "following";

type GetUserConnectionsInput = {
	userId: string;
	type: UserConnectionType;
	cursorId?: string;
	cursorCreatedAt?: string;
	limit: number;
};

const getUserConnections = async ({
	userId,
	type,
	cursorId,
	cursorCreatedAt,
	limit,
}: GetUserConnectionsInput) => {
	const userExists = await prisma.user.findFirst({
		where: { id: userId, active: true },
		select: { id: true },
	});
	if (!userExists) return null;

	const cursorDate = cursorCreatedAt ? new Date(cursorCreatedAt) : null;
	const hasValidCursor =
		cursorDate !== null && !Number.isNaN(cursorDate.getTime()) && cursorId;
	const cursorCondition: Prisma.FollowWhereInput | undefined = hasValidCursor
		? {
				OR: [
					{ createdAt: { lt: cursorDate } },
					{ createdAt: cursorDate, id: { lt: cursorId } },
				],
			}
		: undefined;

	const connections =
		type === "followers"
			? await prisma.follow.findMany({
					where: {
						followingId: userId,
						follower: { active: true },
						...cursorCondition,
					},
					orderBy: [{ createdAt: "desc" }, { id: "desc" }],
					take: limit + 1,
					select: {
						id: true,
						createdAt: true,
						follower: { select: connectionUserSelect },
					},
				})
			: await prisma.follow.findMany({
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

	return {
		users: items.map((connection) =>
			"follower" in connection ? connection.follower : connection.following,
		),
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
	};
};

export { getUserConnections };
export type { UserConnectionType };
