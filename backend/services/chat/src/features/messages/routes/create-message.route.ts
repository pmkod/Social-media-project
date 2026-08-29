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
import { CreateMessageRequestBody } from "../messages.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/discussions/{discussionId}/messages",
	summary: "Send a message",
	tags: [MessagesRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ discussionId: z.string().min(1) }),
		body: {
			content: {
				"application/json": { schema: CreateMessageRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Message sent" },
		[HttpStatus.FORBIDDEN.code]: { description: "Blocked relationship" },
		[HttpStatus.NOT_FOUND.code]: { description: "Discussion not found" },
	},
});

const createMessageRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");
		const { discussionId } = c.req.valid("param");
		const { content, parentMessageId } = c.req.valid("json");
		const membership = await getActiveMembership(
			discussionId,
			authenticatedUserId,
		);

		if (membership.discussion.type === "PRIVATE") {
			const recipient = await prisma.discussionMember.findFirst({
				where: {
					discussionId,
					userId: { not: authenticatedUserId },
					leftAt: null,
				},
				select: { userId: true },
			});
			if (!recipient) {
				throw new HTTPException(409, {
					message: "The private discussion has no recipient",
				});
			}
			const usersMap = await userServiceClient.fetchUsersBatchOrThrow(
				[recipient.userId],
				authenticatedUserId,
			);
			const recipientProfile = usersMap.get(recipient.userId);
			if (!recipientProfile) {
				throw new HTTPException(404, { message: "Recipient not found" });
			}
			if (
				recipientProfile.isBlockedByAuthenticatedUser ||
				recipientProfile.hasBlockedAuthenticatedInUser
			) {
				throw new HTTPException(403, {
					message: "Messages cannot be sent across a blocked relationship",
				});
			}
		}

		if (parentMessageId) {
			const parentMessage = await prisma.message.findFirst({
				where: {
					id: parentMessageId,
					discussionId,
					deletedAt: null,
				},
				select: { id: true },
			});
			if (!parentMessage) {
				throw new HTTPException(404, {
					message: "Parent message not found in this discussion",
				});
			}
		}

		const message = await prisma.$transaction(async (tx) => {
			const createdMessage = await tx.message.create({
				data: {
					discussionId,
					senderId: authenticatedUserId,
					content,
					parentMessageId: parentMessageId || null,
				},
				select: messageDetailsSelect,
			});
			await tx.discussion.updateMany({
				where: {
					id: discussionId,
					lastActivityAt: { lte: createdMessage.createdAt },
				},
				data: {
					lastMessageId: createdMessage.id,
					lastActivityAt: createdMessage.createdAt,
				},
			});
			await tx.discussionMember.updateMany({
				where: {
					discussionId,
					userId: authenticatedUserId,
					leftAt: null,
					lastReadAt: { lt: createdMessage.createdAt },
				},
				data: { lastReadAt: createdMessage.createdAt },
			});
			return createdMessage;
		});

		const usersMap = await userServiceClient.fetchUsersBatch(
			[
				message.senderId,
				...(message.parentMessage ? [message.parentMessage.senderId] : []),
			],
			authenticatedUserId,
		);
		return c.json(
			{ message: presentMessage(message, usersMap) },
			HttpStatus.CREATED.code,
		);
	},
});

export { createMessageRoute };
