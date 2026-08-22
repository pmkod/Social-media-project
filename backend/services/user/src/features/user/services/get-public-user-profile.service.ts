import { prisma } from "@/core/databases";
import type { Prisma } from "@/generated/prisma/client";
import { getBlockRelationships } from "./get-block-relationships.service";

const publicUserProfileSelect = {} satisfies Prisma.UserSelect;

const getPublicUserProfile = async (
	where: Prisma.UserWhereInput,
	authenticatedUserId?: string,
) => {
	const user = await prisma.user.findFirst({
		where: { ...where, active: true },
		select: {
			id: true,
			username: true,
			fullName: true,
			bio: true,
			lowQualityProfilePictureFile: { select: { id: true, filename: true } },
			bestQualityProfilePictureFile: { select: { id: true, filename: true } },
			lowQualityCoverPictureFile: { select: { id: true, filename: true } },
			bestQualityCoverPictureFile: { select: { id: true, filename: true } },
			postCount: true,
			followersCount: true,
			followingCount: true,
			createdAt: true,
		},
	});

	if (!user) return null;

	const isOwnProfile = authenticatedUserId === user.id;
	const [follow, blockRelationships] = await Promise.all([
		authenticatedUserId && !isOwnProfile
			? prisma.follow.findUnique({
					where: {
						followerId_followingId: {
							followerId: authenticatedUserId,
							followingId: user.id,
						},
					},
					select: { id: true },
				})
			: null,
		getBlockRelationships(authenticatedUserId, [user.id]),
	]);
	const isBlockedByAuthenticatedUser =
		blockRelationships.blockedByAuthenticatedUserIds.has(user.id);
	const hasBlockedAuthenticatedInUser =
		blockRelationships.hasBlockedAuthenticatedUserIds.has(user.id);
	const visibleUser = hasBlockedAuthenticatedInUser
		? {
				...user,
				bio: null,
				createdAt: null,
			}
		: user;

	return {
		...visibleUser,
		isFollowedByAuthenticatedUser:
			!isBlockedByAuthenticatedUser &&
			!hasBlockedAuthenticatedInUser &&
			Boolean(follow),
		isBlockedByAuthenticatedUser,
		hasBlockedAuthenticatedInUser,
	};
};

export { getPublicUserProfile, publicUserProfileSelect };
