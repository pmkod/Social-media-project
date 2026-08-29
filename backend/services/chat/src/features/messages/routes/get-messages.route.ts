import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { getActiveMembership } from "@/features/discussions/discussions.service";
import { HTTPException } from "hono/http-exception";
import { MessagesRoutesTag } from "../messages.constants";
import {
	messageDetailsSelect,
	presentMessage,
} from "../messages.presenter";

const routeDef = createRoute({
	method: "get",
	path: "/discussions/{discussionId}/messages",
	summary: "Get a discussion's messages, newest first",
	tags: [MessagesRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ discussionId: z.string().min(1) }),
		query: z.object({
			limit: z.coerce.number().int().min(1).max(100).optional().default(30),
			cursorCreatedAt: z.string().datetime().optional(),
			cursorId: z.string().min(1).optional(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Cursor-paginated messages" },
		[HttpStatus.NOT_FOUND.code]: { description: "Discussion not found" },
	},
});

const getMessagesRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");
		const { discussionId } = c.req.valid("param");
		const { limit, cursorCreatedAt, cursorId } = c.req.valid("query");
		await getActiveMembership(discussionId, authenticatedUserId);

		if (Boolean(cursorCreatedAt) !== Boolean(cursorId)) {
			throw new HTTPException(400, {
				message: "cursorCreatedAt and cursorId must be provided together",
			});
		}
		const cursorDate = cursorCreatedAt ? new Date(cursorCreatedAt) : null;
		const messages = await prisma.message.findMany({
			where: {
				discussionId,
				...(cursorDate && cursorId
					? {
							OR: [
								{ createdAt: { lt: cursorDate } },
								{ createdAt: cursorDate, id: { lt: cursorId } },
							],
						}
					: {}),
			},
			select: messageDetailsSelect,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
		});

		const hasNextPage = messages.length > limit;
		const pageMessages = hasNextPage ? messages.slice(0, limit) : messages;
		const userIds = Array.from(
			new Set(
				pageMessages.flatMap((message) => [
					message.senderId,
					...(message.parentMessage ? [message.parentMessage.senderId] : []),
				]),
			),
		);
		const usersMap = await userServiceClient.fetchUsersBatch(
			userIds,
			authenticatedUserId,
		);
		const lastMessage = pageMessages.at(-1);

		return c.json({
			messages: pageMessages.map((message) =>
				presentMessage(message, usersMap),
			),
			pagination: {
				limit,
				hasNextPage,
				nextCursor:
					hasNextPage && lastMessage
						? {
								createdAt: lastMessage.createdAt,
								id: lastMessage.id,
							}
						: null,
			},
		});
	},
});

export { getMessagesRoute };
