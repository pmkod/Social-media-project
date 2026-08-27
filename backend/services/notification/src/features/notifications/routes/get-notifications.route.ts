import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { Prisma } from "@/generated/prisma/client";
import type { NotificationEventType } from "@/generated/prisma/enums";
import { NotificationsRoutesTag } from "../notifications.constants";

type NotificationGroupRow = {
	eventType: NotificationEventType;
	entityId: string;
	latestCreatedAt: Date;
	latestNotificationId: string;
	latestActorId: string;
	postId: string | null;
	commentId: string | null;
	contentPreview: string | null;
	actorCount: number;
	isSeen: boolean;
};

const routeDef = createRoute({
	method: "get",
	path: "/notifications",
	summary: "Get grouped notifications with cursor pagination",
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
		[HttpStatus.OK.code]: { description: "Grouped notifications" },
	},
});

const getNotificationsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");

		const { limit, cursorCreatedAt, cursorId } = c.req.valid("query");
		const cursorClause =
			cursorCreatedAt && cursorId
				? Prisma.sql`WHERE ("latestCreatedAt" < ${new Date(cursorCreatedAt)} OR ("latestCreatedAt" = ${new Date(cursorCreatedAt)} AND "latestNotificationId" < ${cursorId}))`
				: Prisma.empty;

		const rows = await prisma.$queryRaw<NotificationGroupRow[]>(Prisma.sql`
			WITH "groupedNotifications" AS (
				SELECT
					"event_type" AS "eventType",
					"entity_id" AS "entityId",
					MAX("created_at") AS "latestCreatedAt",
					(ARRAY_AGG("id" ORDER BY "created_at" DESC, "id" DESC))[1] AS "latestNotificationId",
					(ARRAY_AGG("actor_id" ORDER BY "created_at" DESC, "id" DESC))[1] AS "latestActorId",
					(ARRAY_AGG("post_id" ORDER BY "created_at" DESC, "id" DESC))[1] AS "postId",
					(ARRAY_AGG("comment_id" ORDER BY "created_at" DESC, "id" DESC))[1] AS "commentId",
					(ARRAY_AGG("content_preview" ORDER BY "created_at" DESC, "id" DESC))[1] AS "contentPreview",
					COUNT(DISTINCT "actor_id")::INTEGER AS "actorCount",
					BOOL_AND("is_seen") AS "isSeen"
				FROM "notification"
				WHERE "recipient_id" = ${authenticatedUserId}
				GROUP BY "event_type", "entity_id"
			)
			SELECT * FROM "groupedNotifications"
			${cursorClause}
			ORDER BY "latestCreatedAt" DESC, "latestNotificationId" DESC
			LIMIT ${limit + 1}
		`);

		const hasNextPage = rows.length > limit;
		const pageRows = hasNextPage ? rows.slice(0, limit) : rows;
		const actorsMap = await userServiceClient.fetchUsersBatch(
			pageRows.map((row) => row.latestActorId),
			authenticatedUserId,
		);
		const lastRow = pageRows.at(-1);

		return c.json({
			notifications: pageRows.map((row) => ({
				key: `${row.eventType}:${row.entityId}`,
				eventType: row.eventType,
				entityId: row.entityId,
				postId: row.postId,
				commentId: row.commentId,
				contentPreview: row.contentPreview,
				actorCount: row.actorCount,
				actor: actorsMap.get(row.latestActorId) ?? null,
				latestCreatedAt: row.latestCreatedAt,
				isSeen: row.isSeen,
			})),
			pagination: {
				limit,
				hasNextPage,
				nextCursor:
					hasNextPage && lastRow
						? {
								createdAt: lastRow.latestCreatedAt,
								id: lastRow.latestNotificationId,
							}
						: null,
			},
		});
	},
});

export { getNotificationsRoute };
