import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import { userServiceClient } from "@/core/services/user-service.client";
import {
	buildMessageResponse,
	messageDetailsSelect,
} from "@/features/messages/messages.service";
import { Prisma } from "@/generated/prisma/client";

const discussionDetailsInclude = {
	members: {
		where: { hasLeft: false },
		orderBy: { joinedAt: "asc" },
	},
	lastMessage: { select: messageDetailsSelect },
} satisfies Prisma.DiscussionInclude;

type DiscussionDetails = Prisma.DiscussionGetPayload<{
	include: typeof discussionDetailsInclude;
}>;

const getActiveMembership = async (
	discussionId: string,
	userId: string,
) => {
	const membership = await prisma.discussionMember.findUnique({
		where: { discussionId_userId: { discussionId, userId } },
		include: { discussion: true },
	});

	if (
		!membership ||
		membership.hasLeft ||
		membership.isDeleted ||
		membership.discussion.deletedAt
	) {
		throw new Exception({
			code: ExceptionCodes.discussion_not_found,
			message: "Discussion not found",
			status: HttpStatus.NOT_FOUND.code,
		});
	}

	return membership;
};

const requireGroupManager = async (
	discussionId: string,
	userId: string,
) => {
	const membership = await getActiveMembership(discussionId, userId);
	if (membership.discussion.type !== "GROUP") {
		throw new Exception({
			code: ExceptionCodes.group_operation_required,
			message: "This operation is only available for group discussions",
			status: HttpStatus.BAD_REQUEST.code,
		});
	}
	if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
		throw new Exception({
			code: ExceptionCodes.group_manager_required,
			message: "Group manager permissions are required",
			status: HttpStatus.FORBIDDEN.code,
		});
	}

	return membership;
};

const getUnreadMessageCount = async (
	discussionId: string,
	userId: string,
	lastReadAt: Date,
) =>
	await prisma.message.count({
		where: {
			discussionId,
			senderId: { not: userId },
			createdAt: { gt: lastReadAt },
			deletedAt: null,
		},
	});

const buildDiscussionResponses = async (
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
				isStarted: discussion.isStarted,
				creatorId: discussion.creatorId,
				lastActivityAt: discussion.lastActivityAt,
				createdAt: discussion.createdAt,
				updatedAt: discussion.updatedAt,
				currentUserRole: authenticatedMembership?.role ?? null,
				currentUserIsBlocked: authenticatedMembership?.isBlocked ?? false,
				unreadCount,
				members: discussion.members.map((member) => ({
					userId: member.userId,
					role: member.role,
					joinedAt: member.joinedAt,
					lastReadAt: member.lastReadAt,
					user: usersMap.get(member.userId) ?? null,
				})),
				lastMessage: discussion.lastMessage
					? buildMessageResponse(discussion.lastMessage, usersMap)
					: null,
			};
		}),
	);
};

export {
	buildDiscussionResponses,
	discussionDetailsInclude,
	getActiveMembership,
	getUnreadMessageCount,
	requireGroupManager,
};
export type { DiscussionDetails };
