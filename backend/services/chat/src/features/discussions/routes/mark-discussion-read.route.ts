import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { HTTPException } from "hono/http-exception";
import { DiscussionsRoutesTag } from "../discussions.constants";
import {
	getActiveMembership,
	getUnreadMessageCount,
} from "../discussions.service";
import {
	DiscussionIdParams,
	MarkDiscussionReadRequestBody,
} from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "patch",
	path: "/discussions/{discussionId}/read",
	summary: "Mark a discussion as read",
	tags: [DiscussionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: DiscussionIdParams,
		body: {
			content: {
				"application/json": { schema: MarkDiscussionReadRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Read marker updated" },
		[HttpStatus.NOT_FOUND.code]: { description: "Message not found" },
	},
});

const markDiscussionReadRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");
		const { discussionId } = c.req.valid("param");
		const { messageId } = c.req.valid("json");
		await getActiveMembership(discussionId, authenticatedUserId);

		let readAt = new Date();
		if (messageId) {
			const message = await prisma.message.findFirst({
				where: { id: messageId, discussionId },
				select: { createdAt: true },
			});
			if (!message) {
				throw new HTTPException(404, {
					message: "Message not found in this discussion",
				});
			}
			readAt = message.createdAt;
		}

		await prisma.discussionMember.updateMany({
			where: {
				discussionId,
				userId: authenticatedUserId,
				hasLeft: false,
				isDeleted: false,
				lastReadAt: { lt: readAt },
			},
			data: { lastReadAt: readAt },
		});
		const membership = await prisma.discussionMember.findUniqueOrThrow({
			where: {
				discussionId_userId: { discussionId, userId: authenticatedUserId },
			},
			select: { lastReadAt: true },
		});
		const unreadCount = await getUnreadMessageCount(
			discussionId,
			authenticatedUserId,
			membership.lastReadAt,
		);

		return c.json({ readAt: membership.lastReadAt, unreadCount });
	},
});

export { markDiscussionReadRoute };
