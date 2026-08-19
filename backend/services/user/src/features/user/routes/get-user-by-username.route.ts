import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { getBlockRelationships } from "../services/get-block-relationships.service";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/users/by-username/{username}",
	summary: "Get a public user profile by username",
	tags: [UserRoutesTag],
	request: { params: z.object({ username: z.string().min(1) }) },
	responses: {
		[HttpStatus.OK.code]: { description: "Public user profile" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const getUserByUsernameRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { username } = c.req.valid("param");
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;
		const user = await prisma.user.findFirst({
			where: { username, active: true },
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

		if (!user) {
			throw Error("User not found");
		}

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
					location: null,
					website: null,
					createdAt: null,
				}
			: user;

		return c.json({
			user: {
				...visibleUser,
				isOwnProfile,
				isFollowedByAuthenticatedUser:
					!isBlockedByAuthenticatedUser &&
					!hasBlockedAuthenticatedInUser &&
					Boolean(follow),
				isBlockedByAuthenticatedUser,
				hasBlockedAuthenticatedInUser,
			},
		});
	},
});

export { getUserByUsernameRoute };
