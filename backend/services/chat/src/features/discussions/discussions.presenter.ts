import { userServiceClient } from "@/core/services/user-service.client";
import { Prisma } from "@/generated/prisma/client";
import {
	messageDetailsSelect,
	presentMessage,
} from "@/features/messages/messages.presenter";
import { getUnreadMessageCount } from "./discussions.service";

const discussionDetailsInclude = {
	members: {
		where: { leftAt: null },
		orderBy: { joinedAt: "asc" },
	},
	lastMessage: { select: messageDetailsSelect },
} satisfies Prisma.DiscussionInclude;

type DiscussionDetails = Prisma.DiscussionGetPayload<{
	include: typeof discussionDetailsInclude;
}>;

const presentDiscussions = async (
	discussions: DiscussionDetails[],
	authenticatedUserId: string,
) => {
	const userIds = Array.from(
		new Set(
			discussions.flatMap((discussion) => [
				...discussion.members.map((member) => member.userId),
				...(discussion.lastMessage
					? [
							discussion.lastMessage.senderId,
							discussion.lastMessage.parentMessage?.senderId,
						].filter((value): value is string => Boolean(value))
					: []),
			]),
		),
	);
	const usersMap = await userServiceClient.fetchUsersBatch(
		userIds,
		authenticatedUserId,
	);

	return await Promise.all(
		discussions.map(async (discussion) => {
			const authenticatedMembership = discussion.members.find(
				(member) => member.userId === authenticatedUserId,
			);
			const unreadCount = authenticatedMembership
				? await getUnreadMessageCount(
						discussion.id,
						authenticatedUserId,
						authenticatedMembership.lastReadAt,
					)
				: 0;

			return {
				id: discussion.id,
				type: discussion.type,
				name: discussion.name,
				description: discussion.description,
				createdById: discussion.createdById,
				lastActivityAt: discussion.lastActivityAt,
				createdAt: discussion.createdAt,
				updatedAt: discussion.updatedAt,
				currentUserRole: authenticatedMembership?.role ?? null,
				unreadCount,
				members: discussion.members.map((member) => ({
					userId: member.userId,
					role: member.role,
					joinedAt: member.joinedAt,
					lastReadAt: member.lastReadAt,
					user: usersMap.get(member.userId) ?? null,
				})),
				lastMessage: discussion.lastMessage
					? presentMessage(discussion.lastMessage, usersMap)
					: null,
			};
		}),
	);
};

export { discussionDetailsInclude, presentDiscussions };
export type { DiscussionDetails };
