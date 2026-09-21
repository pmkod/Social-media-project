import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { getActiveMembership } from "@/features/discussions/discussions.service";
import {
	MessageImageCompressionFormat,
	MessagesRoutesTag,
} from "../messages.constants";
import {
	buildMessageResponse,
	messageDetailsSelect,
} from "../messages.service";
import { CreateMessageRequestBody } from "../messages.validation-schemas";
import { compressMessageImage } from "../services/message-image-compression.service";
import {
	deleteMessageImage,
	setMessageImage,
} from "../services/message-image-storage.service";

const routeDef = createRoute({
	method: "post",
	path: "/chat/create-message/{discussionId}",
	summary: "Send a message",
	tags: [MessagesRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({ discussionId: z.string().min(1) }),
		body: {
			content: {
				"multipart/form-data": { schema: CreateMessageRequestBody },
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
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { discussionId } = c.req.valid("param");
		const { content, images, parentMessageId } = c.req.valid("form");
		const membership = await getActiveMembership(
			discussionId,
			authenticatedUserId,
		);
		if (membership.isBlocked) {
			throw new Exception({
				code: ExceptionCodes.discussion_blocked,
				message: "This discussion is blocked",
				status: HttpStatus.FORBIDDEN.code,
			});
		}

		if (membership.discussion.type === "PRIVATE") {
			const recipient = await prisma.discussionMember.findFirst({
				where: {
					discussionId,
					userId: { not: authenticatedUserId },
					hasLeft: false,
				},
				select: { userId: true },
			});
			if (!recipient) {
				throw new Exception({
					code: ExceptionCodes.private_discussion_recipient_missing,
					message: "The private discussion has no recipient",
					status: HttpStatus.CONFLICT.code,
				});
			}
			const usersMap = await userServiceClient.fetchUsersBatchOrThrow(
				[recipient.userId],
				authenticatedUserId,
			);
			const recipientProfile = usersMap.get(recipient.userId);
			if (!recipientProfile) {
				throw new Exception({
					code: ExceptionCodes.recipient_not_found,
					message: "Recipient not found",
					status: HttpStatus.NOT_FOUND.code,
				});
			}
			if (
				recipientProfile.isBlockedByAuthenticatedUser ||
				recipientProfile.hasBlockedAuthenticatedInUser
			) {
				throw new Exception({
					code: ExceptionCodes.blocked_relationship,
					message: "Messages cannot be sent across a blocked relationship",
					status: HttpStatus.FORBIDDEN.code,
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
				throw new Exception({
					code: ExceptionCodes.parent_message_not_found,
					message: "Parent message not found in this discussion",
					status: HttpStatus.NOT_FOUND.code,
				});
			}
		}

		const messageId = crypto.randomUUID();
		const uploadedFileNames: string[] = [];
		let message;
		try {
			const imageRecords: Array<{
				id: string;
				type: "IMAGE";
				url: null;
				fileName: string | null;
				mimeType: string;
				position: number;
				lowQualityFileName: string;
				highQualityFileName: string;
			}> = [];
			for (const [index, image] of images.entries()) {
				const compressedImage = await compressMessageImage(image, 50);
				const mediaId = crypto.randomUUID();
				const extensions: Record<string, string> = {
					"image/jpeg": "jpg",
					"image/png": "png",
					"image/webp": "webp",
				};
				const lowExtension =
					extensions[compressedImage.type] ??
					MessageImageCompressionFormat.extension;
				const highExtension = extensions[image.type] ?? "bin";
				const storagePrefix = `messages/${discussionId}/${messageId}`;
				const lowQualityFileName = `${storagePrefix}/${mediaId}_low.${lowExtension}`;
				const highQualityFileName = `${storagePrefix}/${mediaId}_high.${highExtension}`;

				for (const [file, fileName] of [
					[compressedImage, lowQualityFileName],
					[image, highQualityFileName],
				] as const) {
					uploadedFileNames.push(fileName);
					await setMessageImage({ file, fileName });
				}

				imageRecords.push({
					id: mediaId,
					type: "IMAGE" as const,
					url: null,
					fileName: image.name.slice(0, 255) || null,
					mimeType: image.type,
					position: index + 1,
					lowQualityFileName,
					highQualityFileName,
				});
			}

			message = await prisma.$transaction(async (tx) => {
				const createdMessage = await tx.message.create({
					data: {
						id: messageId,
						discussionId,
						senderId: authenticatedUserId,
						content: content || null,
						parentMessageId: parentMessageId || null,
						media: imageRecords.length
							? { create: imageRecords }
							: undefined,
					},
					select: messageDetailsSelect,
				});
				await tx.discussion.updateMany({
					where: {
						id: discussionId,
						lastActivityAt: { lte: createdMessage.createdAt },
					},
					data: {
						isStarted: true,
						lastMessageId: createdMessage.id,
						lastActivityAt: createdMessage.createdAt,
					},
				});
				await tx.discussionMember.updateMany({
					where: {
						discussionId,
						userId: authenticatedUserId,
						hasLeft: false,
						lastReadAt: { lt: createdMessage.createdAt },
					},
					data: { lastReadAt: createdMessage.createdAt },
				});
				await tx.discussionMember.updateMany({
					where: { discussionId, hasLeft: false, isDeleted: true },
					data: { isDeleted: false },
				});
				return createdMessage;
			});
		} catch (error) {
			await Promise.allSettled(
				uploadedFileNames.map((fileName) => deleteMessageImage(fileName)),
			);
			throw error;
		}

		const usersMap = await userServiceClient.fetchUsersBatch(
			[
				message.senderId,
				...(message.parentMessage ? [message.parentMessage.senderId] : []),
			],
			authenticatedUserId,
		);
		return c.json(
			{ message: buildMessageResponse(message, usersMap) },
			HttpStatus.CREATED.code,
		);
	},
});

export { createMessageRoute };
