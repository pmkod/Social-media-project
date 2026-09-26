import type { UserProfileDto } from "@/core/service-clients/user-service.client";
import { Prisma } from "@/generated/prisma/client";

const messageDetailsSelect = {
	id: true,
	discussionId: true,
	senderId: true,
	content: true,
	createdAt: true,
	updatedAt: true,
	editedAt: true,
	deletedAt: true,
	media: {
		select: {
			id: true,
			type: true,
			url: true,
			fileName: true,
			mimeType: true,
			position: true,
			lowQualityFileName: true,
			highQualityFileName: true,
			width: true,
			height: true,
		},
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
	},
	parentMessage: {
		select: {
			id: true,
			senderId: true,
			content: true,
			deletedAt: true,
			media: {
				select: { type: true },
				orderBy: { createdAt: "asc" },
				take: 1,
			},
		},
	},
} satisfies Prisma.MessageSelect;

type MessageDetails = Prisma.MessageGetPayload<{
	select: typeof messageDetailsSelect;
}>;

type MessageMediaDetails = MessageDetails["media"][number];

const buildMessageImageUrl = (
	messageId: string,
	mediaId: string,
	quality: "low" | "high",
) =>
	`/chat/get-message-image/${encodeURIComponent(messageId)}/${encodeURIComponent(mediaId)}/${quality}`;

const buildMessageMediaResponse = (
	media: MessageMediaDetails,
	messageId: string,
) => {
	const lowQualityUrl = media.lowQualityFileName
		? buildMessageImageUrl(messageId, media.id, "low")
		: media.url;
	const highQualityUrl = media.highQualityFileName
		? buildMessageImageUrl(messageId, media.id, "high")
		: media.url;

	return {
		id: media.id,
		type: media.type,
		url: lowQualityUrl ?? highQualityUrl ?? "",
		lowQualityUrl,
		highQualityUrl,
		fileName: media.fileName,
		mimeType: media.mimeType,
		width: media.width,
		height: media.height,
	};
};

const buildMessageResponse = (
	message: MessageDetails,
	usersMap: Map<string, UserProfileDto>,
) => {
	const isDeleted = Boolean(message.deletedAt);
	const parentMessageIsDeleted = Boolean(message.parentMessage?.deletedAt);

	return {
		id: message.id,
		discussionId: message.discussionId,
		senderId: message.senderId,
		content: isDeleted ? null : message.content,
		isDeleted,
		createdAt: message.createdAt,
		updatedAt: message.updatedAt,
		editedAt: message.editedAt,
		deletedAt: message.deletedAt,
		media: isDeleted
			? []
			: message.media.map((media) =>
					buildMessageMediaResponse(media, message.id),
				),
		sender: usersMap.get(message.senderId) ?? null,
		parentMessage: message.parentMessage
			? {
					id: message.parentMessage.id,
					senderId: message.parentMessage.senderId,
					content: parentMessageIsDeleted
						? null
						: message.parentMessage.content,
					isDeleted: parentMessageIsDeleted,
					hasMedia:
						!parentMessageIsDeleted && message.parentMessage.media.length > 0,
				}
			: null,
	};
};

export {
	buildMessageMediaResponse,
	buildMessageResponse,
	messageDetailsSelect,
};
export type { MessageDetails, MessageMediaDetails };
