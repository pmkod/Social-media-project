import { prisma } from "@/core/databases";

type BlockRelationships = {
	blockedByAuthenticatedUserIds: Set<string>;
	hasBlockedAuthenticatedUserIds: Set<string>;
};

const getBlockRelationships = async (
	authenticatedUserId: string | undefined,
	userIds: string[],
): Promise<BlockRelationships> => {
	const uniqueUserIds = Array.from(new Set(userIds));
	if (!authenticatedUserId || uniqueUserIds.length === 0) {
		return {
			blockedByAuthenticatedUserIds: new Set(),
			hasBlockedAuthenticatedUserIds: new Set(),
		};
	}

	const blocks = await prisma.block.findMany({
		where: {
			OR: [
				{
					blockerId: authenticatedUserId,
					blockedId: { in: uniqueUserIds },
				},
				{
					blockerId: { in: uniqueUserIds },
					blockedId: authenticatedUserId,
				},
			],
		},
		select: { blockerId: true, blockedId: true },
	});

	const blockedByAuthenticatedUserIds = new Set<string>();
	const hasBlockedAuthenticatedUserIds = new Set<string>();
	for (const block of blocks) {
		if (block.blockerId === authenticatedUserId) {
			blockedByAuthenticatedUserIds.add(block.blockedId);
		} else {
			hasBlockedAuthenticatedUserIds.add(block.blockerId);
		}
	}

	return {
		blockedByAuthenticatedUserIds,
		hasBlockedAuthenticatedUserIds,
	};
};

export { getBlockRelationships };
export type { BlockRelationships };
