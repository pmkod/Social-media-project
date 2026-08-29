import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { getActiveMembership } from "@/features/discussions/discussions.service";
import { HTTPException } from "hono/http-exception";
import { MessagesRoutesTag } from "../messages.constants";
import { MessageIdParams } from "../messages.validation-schemas";

const routeDef = createRoute({
	method: "delete",
	path: "/messages/{messageId}",
	summary: "Delete one of the authenticated user's messages",
	tags: [MessagesRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: MessageIdParams },
	responses: {
		[HttpStatus.OK.code]: { description: "Message deleted" },
		[HttpStatus.FORBIDDEN.code]: { description: "Not the message sender" },
		[HttpStatus.NOT_FOUND.code]: { description: "Message not found" },
	},
});

const deleteMessageRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");
		const { messageId } = c.req.valid("param");
		const message = await prisma.message.findUnique({
			where: { id: messageId },
			select: { discussionId: true, senderId: true, deletedAt: true },
		});
		if (!message) {
			throw new HTTPException(404, { message: "Message not found" });
		}
		await getActiveMembership(message.discussionId, authenticatedUserId);
		if (message.senderId !== authenticatedUserId) {
			throw new HTTPException(403, {
				message: "Only the sender can delete this message",
			});
		}
		if (!message.deletedAt) {
			await prisma.message.update({
				where: { id: messageId },
				data: { content: "", deletedAt: new Date() },
			});
		}

		return c.json({ success: true, alreadyDeleted: Boolean(message.deletedAt) });
	},
});

export { deleteMessageRoute };
