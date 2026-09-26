import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import {
	NotificationEventTypes,
	NotificationGroupKeyBuilder,
	notificationServiceClient,
} from "@/core/service-clients/notification-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "post",
	path: "/user/follow-user/{id}",
	summary: "Follow a user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ id: z.string() }) },
	responses: {
		[HttpStatus.CREATED.code]: { description: "User followed" },
	},
});

const followUserRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		const { id: userId } = c.req.valid("param");

		if (userId === authenticatedUser.id) {
			throw new Exception({
				code: ExceptionCodes.cannot_follow_yourself,
				message: "You cannot follow yourself",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		const targetUser = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: { id: true },
		});
		if (targetUser === null) {
			throw new Exception({
				code: ExceptionCodes.user_not_found,
				message: "User not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}
		const block = await prisma.block.findFirst({
			where: {
				OR: [
					{ blockerId: authenticatedUser.id, blockedId: userId },
					{ blockerId: userId, blockedId: authenticatedUser.id },
				],
			},
			select: { blockerId: true },
		});
		if (block) {
			throw new Exception({
				code: ExceptionCodes.cannot_follow_blocked_user,
				message: "You cannot follow a user involved in a block",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		const existingFollow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: authenticatedUser.id,
					followingId: userId,
				},
			},
			select: { followerId: true },
		});

		const updatedTargetUser = existingFollow
			? await prisma.user.findUniqueOrThrow({
					where: { id: userId },
					select: { followersCount: true },
				})
			: await prisma.$transaction(async (tx) => {
					await tx.follow.create({
						data: { followerId: authenticatedUser.id, followingId: userId },
					});
					await tx.user.update({
						where: { id: authenticatedUser.id },
						data: { followingCount: { increment: 1 } },
					});
					return tx.user.update({
						where: { id: userId },
						data: { followersCount: { increment: 1 } },
						select: { followersCount: true },
					});
				});

		if (!existingFollow) {
			await notificationServiceClient.createNotification({
				recipientId: userId,
				initiatorId: authenticatedUser.id,
				eventType: NotificationEventTypes.FOLLOW,
				groupKey: NotificationGroupKeyBuilder.buildFollow(),
			});
		}

		return c.json(
			{
				message: "Success",
				followedUser: {
					id: targetUser.id,
					isFollowedByAuthenticatedUser: true,
					followersCount: updatedTargetUser.followersCount,
				},
			},
			HttpStatus.OK.code,
		);
	},
});

export { followUserRoute };
