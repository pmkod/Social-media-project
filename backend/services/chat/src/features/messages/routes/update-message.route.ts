import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import {
	userServiceClient,
	type UserProfileDto,
} from "@/core/service-clients/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { getActiveMembership } from "@/features/discussions/discussions.service";
import { MessagesRoutesTag } from "../messages.constants";
import {
	buildMessageResponse,
	messageDetailsSelect,
} from "../messages.service";
import {
	MessageIdParams,
	UpdateMessageRequestBody,
} from "../messages.validation-schemas";

const routeDef = createRoute({
	method: "patch",
	path: "/chat/update-message/{messageId}",
	summary: "Edit one of the authenticated user's messages",
	tags: [MessagesRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: MessageIdParams,
		body: {
			content: {
				"application/json": { schema: UpdateMessageRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Message edited" },
		[HttpStatus.FORBIDDEN.code]: { description: "Not the message sender" },
		[HttpStatus.NOT_FOUND.code]: { description: "Message not found" },
	},
});

const updateMessageRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { messageId } = c.req.valid("param");
		const { content } = c.req.valid("json");
		const existingMessage = await prisma.message.findUnique({
			where: { id: messageId },
			select: {
				discussionId: true,
				senderId: true,
				deletedAt: true,
				content: true,
			},
		});
		if (!existingMessage) {
			throw new Exception({
				code: ExceptionCodes.message_not_found,
				message: "Message not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}
		await getActiveMembership(
			existingMessage.discussionId,
			authenticatedUserId,
		);
		if (existingMessage.senderId !== authenticatedUserId) {
			throw new Exception({
				code: ExceptionCodes.sender_required_to_edit_message,
				message: "Only the sender can edit this message",
				status: HttpStatus.FORBIDDEN.code,
			});
		}
		if (existingMessage.deletedAt) {
			throw new Exception({
				code: ExceptionCodes.deleted_message_edit_forbidden,
				message: "A deleted message cannot be edited",
				status: HttpStatus.CONFLICT.code,
			});
		}

		const message = await prisma.message.update({
			where: { id: messageId },
			data: {
				content,
				...(content !== existingMessage.content ? { editedAt: new Date() } : {}),
			},
			select: messageDetailsSelect,
		});
		const userIds = [
			message.senderId,
			...(message.parentMessage ? [message.parentMessage.senderId] : []),
		];
		const [{ users }, relationships] = await Promise.all([
			userServiceClient.fetchActiveUsersBatch(userIds),
			userServiceClient.checkBlockRelationships(
				authenticatedUserId,
				userIds,
			),
		]);
		const blockedUserIds = new Set(relationships.blockedUserIds);
		const blockedByUserIds = new Set(relationships.blockedByUserIds);
		const usersMap = new Map<string, UserProfileDto>();
		for (const user of users) {
			usersMap.set(user.id, {
				...user,
				isBlockedByAuthenticatedUser: blockedUserIds.has(user.id),
				hasBlockedAuthenticatedInUser: blockedByUserIds.has(user.id),
			});
		}
		return c.json({ message: buildMessageResponse(message, usersMap) });
	},
});

export { updateMessageRoute };
