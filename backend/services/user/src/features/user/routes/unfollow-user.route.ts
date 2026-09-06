import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import {
	NotificationEventTypes,
	NotificationGroupKeyBuilder,
	notificationServiceClient,
} from "@/core/services/notification-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/users/{id}/follow",
	summary: "Unfollow a user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ id: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "User unfollowed" },
	},
});

const unfollowUserRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		const { id: userId } = c.req.valid("param");

		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, followersCount: true },
		});

		if (!targetUser) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		const existingFollow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: authenticatedUser.id,
					followingId: userId,
				},
			},
			select: { id: true },
		});

		if (existingFollow) {
			targetUser.followersCount = await prisma.$transaction(async (tx) => {
				await tx.follow.delete({
					where: {
						followerId_followingId: {
							followerId: authenticatedUser.id,
							followingId: userId,
						},
					},
				});
				await tx.user.update({
					where: { id: authenticatedUser.id },
					data: { followingCount: { decrement: 1 } },
				});
				const updatedTargetUser = await tx.user.update({
					where: { id: userId },
					data: { followersCount: { decrement: 1 } },
					select: { followersCount: true },
				});
				return updatedTargetUser.followersCount;
			});
			await notificationServiceClient.removeNotification({
				eventType: NotificationEventTypes.FOLLOW,
				recipientId: userId,
				initiatorId: authenticatedUser.id,
				groupKey: NotificationGroupKeyBuilder.buildFollow(),
			});
		}

		return c.json(
			{
				message: "Success",
				unfollowedUser: {
					id: targetUser.id,
					isFollowedByAuthenticatedUser: false,
					followersCount: targetUser.followersCount,
				},
			},
			HttpStatus.OK.code,
		);
	},
});

export { unfollowUserRoute };
