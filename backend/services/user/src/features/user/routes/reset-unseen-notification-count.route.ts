import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "patch",
	path: "/internal/user/reset-unseen-notification-count/{userId}",
	summary: "Reset a user's unseen notification count",
	tags: [UserRoutesTag],
	request: {
		params: z.object({ userId: z.string() }),
	},
	responses: {
		[HttpStatus.OK.code]: {
			content: {
				"application/json": {
					schema: z.object({
						user: z.object({
							unseenNotificationsCount: z.number().int().nonnegative(),
						}),
					}),
				},
			},
			description: "Notification count reset",
		},
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const resetUnseenNotificationCountRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { unseenNotificationsCount: 0 },
			select: { unseenNotificationsCount: true },
		});
		return c.json({ user: updatedUser });
	},
});

export { resetUnseenNotificationCountRoute };
