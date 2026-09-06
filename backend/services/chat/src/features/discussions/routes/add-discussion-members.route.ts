import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { HTTPException } from "hono/http-exception";
import { DiscussionMembersRoutesTag } from "../discussions.constants";
import { uniqueOtherUserIds } from "../discussions.functions";
import { requireGroupManager } from "../discussions.service";
import {
	AddDiscussionMembersRequestBody,
	DiscussionIdParams,
} from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/discussions/{discussionId}/members",
	summary: "Add members to a group discussion",
	tags: [DiscussionMembersRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: DiscussionIdParams,
		body: {
			content: {
				"application/json": { schema: AddDiscussionMembersRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Members added" },
		[HttpStatus.FORBIDDEN.code]: { description: "Manager role required" },
	},
});

const addDiscussionMembersRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { discussionId } = c.req.valid("param");
		const { userIds } = c.req.valid("json");
		await requireGroupManager(discussionId, authenticatedUserId);

		const uniqueUserIds = uniqueOtherUserIds(userIds, authenticatedUserId);
		if (uniqueUserIds.length === 0) {
			throw new HTTPException(400, { message: "No new member was provided" });
		}
		const usersMap = await userServiceClient.fetchUsersBatchOrThrow(
			uniqueUserIds,
			authenticatedUserId,
		);
		const missingUserIds = uniqueUserIds.filter(
			(userId) => !usersMap.has(userId),
		);
		if (missingUserIds.length > 0) {
			throw new HTTPException(404, {
				message: `Users not found: ${missingUserIds.join(", ")}`,
			});
		}
		const blockedUser = uniqueUserIds.find((userId) => {
			const user = usersMap.get(userId);
			return (
				user?.isBlockedByAuthenticatedUser ||
				user?.hasBlockedAuthenticatedInUser
			);
		});
		if (blockedUser) {
			throw new HTTPException(403, {
				message: "A group cannot include a blocked user",
			});
		}

		const activeMembers = await prisma.discussionMember.findMany({
			where: {
				discussionId,
				userId: { in: uniqueUserIds },
				hasLeft: false,
			},
			select: { userId: true },
		});
		const activeUserIds = new Set(activeMembers.map((member) => member.userId));
		const addedUserIds = uniqueUserIds.filter(
			(userId) => !activeUserIds.has(userId),
		);
		const now = new Date();

		await prisma.$transaction(
			addedUserIds.map((userId) =>
				prisma.discussionMember.upsert({
					where: { discussionId_userId: { discussionId, userId } },
					create: {
						discussionId,
						userId,
						role: "MEMBER",
						joinedAt: now,
						lastReadAt: now,
					},
					update: {
						role: "MEMBER",
						joinedAt: now,
						lastReadAt: now,
						hasLeft: false,
						isDeleted: false,
						isBlocked: false,
					},
				}),
			),
		);

		return c.json({ addedUserIds, addedCount: addedUserIds.length });
	},
});

export { addDiscussionMembersRoute };
