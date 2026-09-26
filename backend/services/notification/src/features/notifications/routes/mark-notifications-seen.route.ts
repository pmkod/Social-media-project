import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/service-clients/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { NotificationsRoutesTag } from "../notifications.constants";

const routeDef = createRoute({
	method: "patch",
	path: "/notification/mark-notifications-seen",
	summary: "Mark all notifications as seen",
	tags: [NotificationsRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.OK.code]: { description: "Notifications marked as seen" },
	},
});

const markNotificationsSeenRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;

		const updated = await prisma.notification.updateMany({
			where: { recipientId: authenticatedUserId, isSeen: false },
			data: { isSeen: true },
		});
		await userServiceClient.resetUnseenNotificationCount(authenticatedUserId);

		return c.json({ updatedCount: updated.count });
	},
});

export { markNotificationsSeenRoute };
