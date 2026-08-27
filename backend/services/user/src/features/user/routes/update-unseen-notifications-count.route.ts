import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { UserRoutesTag } from "../user.constants";

const UpdateUnseenNotificationsCountBody = z.union([
	z.object({ delta: z.number().int().min(-10000).max(10000) }),
	z.object({ reset: z.literal(true) }),
]);

const routeDef = createRoute({
	method: "patch",
	path: "/internal/users/{userId}/unseen-notifications-count",
	summary: "Update a user's unseen notification count",
	tags: [UserRoutesTag],
	request: {
		params: z.object({ userId: z.string() }),
		body: {
			content: {
				"application/json": { schema: UpdateUnseenNotificationsCountBody },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Notification count updated" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const updateUnseenNotificationsCountRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const operation = c.req.valid("json");
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});
		if (!user) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		if ("reset" in operation) {
			await prisma.user.update({
				where: { id: userId },
				data: { unseenNotificationsCount: 0 },
			});
		} else {
			await prisma.$executeRaw`
				UPDATE "user"
				SET
					"unseen_notifications_count" = GREATEST(0, "unseen_notifications_count" + ${operation.delta}),
					"updated_at" = CURRENT_TIMESTAMP
				WHERE "id" = ${userId}
			`;
		}

		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: { id: userId },
			select: { unseenNotificationsCount: true },
		});
		return c.json(updatedUser);
	},
});

export { updateUnseenNotificationsCountRoute };
