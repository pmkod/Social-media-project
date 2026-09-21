import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { getActiveMembership } from "@/features/discussions/discussions.service";
import { MessagesRoutesTag } from "../messages.constants";
import { MessageIdParams } from "../messages.validation-schemas";

const routeDef = createRoute({
	method: "delete",
	path: "/chat/delete-message/{messageId}",
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
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { messageId } = c.req.valid("param");
		const message = await prisma.message.findUnique({
			where: { id: messageId },
			select: { discussionId: true, senderId: true, deletedAt: true },
		});
		if (!message) {
			throw new Exception({
				code: ExceptionCodes.message_not_found,
				message: "Message not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}
		await getActiveMembership(message.discussionId, authenticatedUserId);
		if (message.senderId !== authenticatedUserId) {
			throw new Exception({
				code: ExceptionCodes.sender_required_to_delete_message,
				message: "Only the sender can delete this message",
				status: HttpStatus.FORBIDDEN.code,
			});
		}
		if (!message.deletedAt) {
			await prisma.message.update({
				where: { id: messageId },
				data: { content: "", deletedAt: new Date() },
			});
		}

		return c.json({
			message: message.deletedAt
				? "Message already deleted"
				: "Message deleted successfully",
			alreadyDeleted: Boolean(message.deletedAt),
		});
	},
});

export { deleteMessageRoute };
