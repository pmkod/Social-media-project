import { prisma } from "@/core/databases";
import type { Prisma } from "@/generated/prisma/client";
import { getBlockRelationships } from "./get-block-relationships.service";
import { hydrateProfileMediaFiles } from "./get-profile-media-files.service";

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
			lowQualityProfilePictureFileId: true,
			bestQualityProfilePictureFileId: true,
			lowQualityCoverPictureFileId: true,
			bestQualityCoverPictureFileId: true,
			postCount: true,
			followersCount: true,
			followingCount: true,
			createdAt: true,
		},
	});

	if (!user) return null;
	const [hydratedUser] = await hydrateProfileMediaFiles([user]);

	const isOwnProfile = authenticatedUserId === hydratedUser.id;
	const [follow, blockRelationships] = await Promise.all([
		authenticatedUserId && !isOwnProfile
			? prisma.follow.findUnique({
					where: {
						followerId_followingId: {
							followerId: authenticatedUserId,
							followingId: user.id,
						},
					},
					select: { followerId: true },
				})
			: null,
		getBlockRelationships(authenticatedUserId, [hydratedUser.id]),
	]);
	const isBlockedByAuthenticatedUser =
		blockRelationships.blockedByAuthenticatedUserIds.has(hydratedUser.id);
	const hasBlockedAuthenticatedInUser =
		blockRelationships.hasBlockedAuthenticatedUserIds.has(hydratedUser.id);
	const visibleUser = hasBlockedAuthenticatedInUser
		? {
				...hydratedUser,
				bio: null,
				createdAt: null,
			}
		: hydratedUser;

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
