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
	method: "post",
	path: "/users/{id}/follow",
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
		if (!authenticatedUser) throw new Error("Unauthorized");
		const { id: userId } = c.req.valid("param");

		if (userId === authenticatedUser.id) {
			return c.json(
				{ message: "You cannot follow yourself" },
				HttpStatus.BAD_REQUEST.code,
			);
		}

		const targetUser = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: { id: true },
		});
		if (targetUser === null) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}
		const block = await prisma.block.findFirst({
			where: {
				OR: [
					{ blockerId: authenticatedUser.id, blockedId: userId },
					{ blockerId: userId, blockedId: authenticatedUser.id },
				],
			},
			select: { id: true },
		});
		if (block) {
			return c.json(
				{ message: "You cannot follow a user involved in a block" },
				HttpStatus.BAD_REQUEST.code,
			);
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
