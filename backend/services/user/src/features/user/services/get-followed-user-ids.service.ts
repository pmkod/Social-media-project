import { prisma } from "@/core/databases";

const getFollowedUserIds = async (
	authenticatedUserId: string | undefined,
	userIds: string[],
) => {
	if (!authenticatedUserId || userIds.length === 0) {
		return new Set<string>();
	}

	const follows = await prisma.follow.findMany({
		where: {
			followerId: authenticatedUserId,
			followingId: { in: userIds },
		},
		select: { followingId: true },
	});

	return new Set(follows.map((follow) => follow.followingId));
};

export { getFollowedUserIds };
