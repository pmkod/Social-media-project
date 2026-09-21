import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import {
	NotificationEventTypes,
	NotificationGroupKeyBuilder,
	notificationServiceClient,
} from "@/core/services/notification-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "post",
	path: "/user/block-user/{id}",
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

		if (userId === authenticatedUser.id) {
			throw new Exception({
				code: ExceptionCodes.cannot_block_yourself,
				message: "You cannot block yourself",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		const targetUser = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: { id: true },
		});

		if (!targetUser) {
			throw new Exception({
				code: ExceptionCodes.user_not_found,
				message: "User not found",
				status: HttpStatus.NOT_FOUND.code,
			});
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

		const followRelationshipWhere = {
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
		};
		const follows = await prisma.follow.findMany({
			where: followRelationshipWhere,
			select: { followerId: true },
		});

		if (follows.length > 0) {
			await prisma.follow.deleteMany({
				where: followRelationshipWhere,
			});
		}

		const authenticatedUserWasFollowing = follows.some(
			(follow) => follow.followerId === authenticatedUser.id,
		);
		const targetUserWasFollowing = follows.some(
			(follow) => follow.followerId === userId,
		);
		if (authenticatedUserWasFollowing) {
			await notificationServiceClient.removeNotification({
				eventType: NotificationEventTypes.FOLLOW,
				recipientId: userId,
				initiatorId: authenticatedUser.id,
				groupKey: NotificationGroupKeyBuilder.buildFollow(),
			});
		}
		if (targetUserWasFollowing) {
			await notificationServiceClient.removeNotification({
				eventType: NotificationEventTypes.FOLLOW,
				recipientId: authenticatedUser.id,
				initiatorId: userId,
				groupKey: NotificationGroupKeyBuilder.buildFollow(),
			});
		}

		await prisma.user.update({
			where: { id: authenticatedUser.id },
			data: {
				followingCount: authenticatedUserWasFollowing
					? { decrement: 1 }
					: undefined,
				followersCount: targetUserWasFollowing ? { decrement: 1 } : undefined,
			},
		});

		const updatedTargetUser = await prisma.user.update({
			where: { id: userId },
			data: {
				followersCount: authenticatedUserWasFollowing
					? { decrement: 1 }
					: undefined,
				followingCount: targetUserWasFollowing ? { decrement: 1 } : undefined,
			},
			select: {
				id: true,
				followersCount: true,
				followingCount: true,
			},
		});

		const result = {
			updatedTargetUser,
		};

		return c.json({
			message: "Success",
			blockedUser: {
				...result.updatedTargetUser,
				isFollowedByAuthenticatedUser: false,
				isBlockedByAuthenticatedUser: true,
			},
		});
	},
});

export { blockUserRoute };
