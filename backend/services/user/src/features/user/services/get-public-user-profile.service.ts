import { prisma } from "@/core/databases";
import type { Prisma } from "@/generated/prisma/client";

const publicUserProfileSelect = {
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
} satisfies Prisma.UserSelect;

const getPublicUserProfile = async (
	where: Prisma.UserWhereInput,
	authenticatedUserId?: string,
) => {
	const user = await prisma.user.findFirst({
		where: { ...where, active: true },
		select: publicUserProfileSelect,
	});

	if (!user) return null;

	const isOwnProfile = authenticatedUserId === user.id;
	const follow =
		authenticatedUserId && !isOwnProfile
			? await prisma.follow.findUnique({
					where: {
						followerId_followingId: {
							followerId: authenticatedUserId,
							followingId: user.id,
						},
					},
					select: { id: true },
				})
			: null;

	return {
		...user,
		isOwnProfile,
		isFollowedByAuthenticatedUser: Boolean(follow),
	};
};

export { getPublicUserProfile, publicUserProfileSelect };
