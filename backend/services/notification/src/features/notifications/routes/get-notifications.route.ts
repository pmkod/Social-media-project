import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { NotificationsRoutesTag } from "../notifications.constants";

const routeDef = createRoute({
	method: "get",
	path: "/notifications",
	summary: "Get notifications with cursor pagination",
	tags: [NotificationsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			limit: z.coerce.number().int().min(1).max(50).optional().default(25),
			cursorCreatedAt: z.string().datetime().optional(),
			cursorId: z.string().optional(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Notifications" },
	},
});

const getNotificationsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser")?.id;
		if (!authenticatedUserId) throw new Error("Unauthorized");

		const { limit, cursorCreatedAt, cursorId } = c.req.valid("query");
		const cursorDate =
			cursorCreatedAt && cursorId ? new Date(cursorCreatedAt) : undefined;
		const notificationRows = await prisma.notification.findMany({
			where: {
				recipientId: authenticatedUserId,
				...(cursorDate && cursorId
					? {
							OR: [
								{ createdAt: { lt: cursorDate } },
								{ createdAt: cursorDate, id: { lt: cursorId } },
							],
						}
					: {}),
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			select: {
				id: true,
				initiatorId: true,
				eventType: true,
				targetId: true,
				groupKey: true,
				isSeen: true,
				createdAt: true,
			},
		});

		const hasNextPage = notificationRows.length > limit;
		const pageRows = hasNextPage
			? notificationRows.slice(0, limit)
			: notificationRows;
		const initiatorsMap = await userServiceClient.fetchUsersBatch(
			pageRows.map((row) => row.initiatorId),
			authenticatedUserId,
		);
		const lastRow = pageRows.at(-1);

		return c.json({
			notifications: pageRows.map((row) => ({
				id: row.id,
				eventType: row.eventType,
				initiatorId: row.initiatorId,
				targetId: row.targetId,
				groupKey: row.groupKey,
				initiator: initiatorsMap.get(row.initiatorId) ?? null,
				isSeen: row.isSeen,
				createdAt: row.createdAt,
			})),
			pagination: {
				limit,
				hasNextPage,
				nextCursor:
					hasNextPage && lastRow
						? {
								createdAt: lastRow.createdAt,
								id: lastRow.id,
							}
						: null,
			},
		});
	},
});

export { getNotificationsRoute };
