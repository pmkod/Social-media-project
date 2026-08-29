import { prisma } from "@/core/databases";
import { HTTPException } from "hono/http-exception";

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
		membership.leftAt ||
		membership.discussion.deletedAt
	) {
		throw new HTTPException(404, { message: "Discussion not found" });
	}

	return membership;
};

const requireGroupManager = async (
	discussionId: string,
	userId: string,
) => {
	const membership = await getActiveMembership(discussionId, userId);
	if (membership.discussion.type !== "GROUP") {
		throw new HTTPException(400, {
			message: "This operation is only available for group discussions",
		});
	}
	if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
		throw new HTTPException(403, {
			message: "Group manager permissions are required",
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

export { getActiveMembership, getUnreadMessageCount, requireGroupManager };
