import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { DiscussionMembersRoutesTag } from "../discussions.constants";
import { getActiveMembership } from "../discussions.service";
import {
	DiscussionMemberParams,
	UpdateDiscussionMemberRequestBody,
} from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "patch",
	path: "/discussions/{discussionId}/members/{userId}",
	summary: "Promote or demote a group member",
	tags: [DiscussionMembersRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: DiscussionMemberParams,
		body: {
			content: {
				"application/json": { schema: UpdateDiscussionMemberRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Member role updated" },
		[HttpStatus.FORBIDDEN.code]: { description: "Owner role required" },
	},
});

const updateDiscussionMemberRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { discussionId, userId } = c.req.valid("param");
		const { role, isBlocked } = c.req.valid("json");
		const actorMembership = await getActiveMembership(
			discussionId,
			authenticatedUserId,
		);
		if (isBlocked !== undefined) {
			if (userId !== authenticatedUserId) {
				throw new Exception({
					code: ExceptionCodes.own_blocked_state_only,
					message: "Members can only change their own blocked state",
					status: HttpStatus.FORBIDDEN.code,
				});
			}
			const member = await prisma.discussionMember.update({
				where: { discussionId_userId: { discussionId, userId } },
				data: { isBlocked },
				select: { userId: true, role: true, joinedAt: true, isBlocked: true },
			});
			return c.json({ member });
		}

		if (!role)
			throw new Exception({
				code: ExceptionCodes.member_role_missing,
				message: "Member role missing",
				status: HttpStatus.BAD_REQUEST.code,
			});
		if (
			actorMembership.discussion.type !== "GROUP" ||
			actorMembership.role !== "OWNER"
		) {
			throw new Exception({
				code: ExceptionCodes.group_owner_required_to_change_roles,
				message: "Only the group owner can change member roles",
				status: HttpStatus.FORBIDDEN.code,
			});
		}
		if (userId === authenticatedUserId) {
			throw new Exception({
				code: ExceptionCodes.owner_cannot_change_own_role,
				message: "The owner cannot change their own role",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		const targetMembership = await prisma.discussionMember.findUnique({
			where: { discussionId_userId: { discussionId, userId } },
		});
		if (!targetMembership || targetMembership.hasLeft) {
			throw new Exception({
				code: ExceptionCodes.group_member_not_found,
				message: "Group member not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}
		if (targetMembership.role === "OWNER") {
			throw new Exception({
				code: ExceptionCodes.owner_role_change_forbidden,
				message: "The owner role cannot be changed here",
				status: HttpStatus.CONFLICT.code,
			});
		}

		const member = await prisma.discussionMember.update({
			where: { discussionId_userId: { discussionId, userId } },
			data: { role },
			select: { userId: true, role: true, joinedAt: true },
		});
		return c.json({ member });
	},
});

export { updateDiscussionMemberRoute };
