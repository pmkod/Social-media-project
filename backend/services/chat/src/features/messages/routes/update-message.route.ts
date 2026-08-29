import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
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
import {
	MessageIdParams,
	UpdateMessageRequestBody,
} from "../messages.validation-schemas";

const routeDef = createRoute({
	method: "patch",
	path: "/messages/{messageId}",
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
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");
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
			throw new HTTPException(404, { message: "Message not found" });
		}
		await getActiveMembership(
			existingMessage.discussionId,
			authenticatedUserId,
		);
		if (existingMessage.senderId !== authenticatedUserId) {
			throw new HTTPException(403, {
				message: "Only the sender can edit this message",
			});
		}
		if (existingMessage.deletedAt) {
			throw new HTTPException(409, {
				message: "A deleted message cannot be edited",
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
		const usersMap = await userServiceClient.fetchUsersBatch(
			[
				message.senderId,
				...(message.parentMessage ? [message.parentMessage.senderId] : []),
			],
			authenticatedUserId,
		);
		return c.json({ message: presentMessage(message, usersMap) });
	},
});

export { updateMessageRoute };
