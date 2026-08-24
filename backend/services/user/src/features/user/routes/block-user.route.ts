import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "post",
	path: "/users/{id}/block",
	summary: "Block a user and remove follows in both directions",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ id: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "User blocked" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const blockUserRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { id: userId } = c.req.valid("param");

		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");

		if (userId === authenticatedUser.id) {
			throw Error("You cannot block yourself");
		}

		const targetUser = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: { id: true },
		});

		if (!targetUser) {
			throw Error("User not found");
		}

		await prisma.block.upsert({
			where: {
				blockerId_blockedId: {
					blockerId: authenticatedUser.id,
					blockedId: userId,
				},
			},
			create: { blockerId: authenticatedUser.id, blockedId: userId },
			update: {},
		});

		const follows = await prisma.follow.findMany({
			where: {
				OR: [
					{
						followerId: authenticatedUser.id,
						followingId: userId,
					},
					{
						followerId: userId,
						followingId: authenticatedUser.id,
					},
				],
			},
			select: { id: true, followerId: true },
		});

		if (follows.length > 0) {
			await prisma.follow.deleteMany({
				where: { id: { in: follows.map((follow) => follow.id) } },
			});
		}

		const authenticatedUserWasFollowing = follows.some(
			(follow) => follow.followerId === authenticatedUser.id,
		);
		const targetUserWasFollowing = follows.some(
			(follow) => follow.followerId === userId,
		);

		const updatedAuthenticatedUser = await prisma.user.update({
			where: { id: authenticatedUser.id },
			data: {
				followingCount: authenticatedUserWasFollowing
					? { decrement: 1 }
					: undefined,
				followersCount: targetUserWasFollowing
					? { decrement: 1 }
					: undefined,
			},
			select: { id: true, followersCount: true, followingCount: true },
		});

		const updatedTargetUser = await prisma.user.update({
			where: { id: userId },
			data: {
				followersCount: authenticatedUserWasFollowing
					? { decrement: 1 }
					: undefined,
				followingCount: targetUserWasFollowing
					? { decrement: 1 }
					: undefined,
			},
			select: {
				id: true,
				followersCount: true,
				followingCount: true,
			},
		});

		const reciprocalBlock = await prisma.block.findUnique({
			where: {
				blockerId_blockedId: {
					blockerId: userId,
					blockedId: authenticatedUser.id,
				},
			},
			select: { id: true },
		});

		const result = {
			updatedAuthenticatedUser,
			updatedTargetUser,
			reciprocalBlock,
		};

		return c.json({
			message: "Success",
			blockedUser: {
				...result.updatedTargetUser,
				isFollowedByAuthenticatedUser: false,
				isBlockedByAuthenticatedUser: true,
				hasBlockedAuthenticatedInUser: Boolean(result.reciprocalBlock),
			},
			authenticatedUser: result.updatedAuthenticatedUser,
		});
	},
});

export { blockUserRoute };
