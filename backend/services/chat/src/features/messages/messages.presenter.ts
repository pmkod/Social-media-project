import type { UserProfileDto } from "@/core/services/user-service.client";
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
	parentMessage: {
		select: {
			id: true,
			senderId: true,
			content: true,
			deletedAt: true,
		},
	},
} satisfies Prisma.MessageSelect;

type MessageDetails = Prisma.MessageGetPayload<{
	select: typeof messageDetailsSelect;
}>;

const presentMessage = (
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
		sender: usersMap.get(message.senderId) ?? null,
		parentMessage: message.parentMessage
			? {
					id: message.parentMessage.id,
					senderId: message.parentMessage.senderId,
					content: parentMessageIsDeleted
						? null
						: message.parentMessage.content,
					isDeleted: parentMessageIsDeleted,
				}
			: null,
	};
};

export { messageDetailsSelect, presentMessage };
export type { MessageDetails };
