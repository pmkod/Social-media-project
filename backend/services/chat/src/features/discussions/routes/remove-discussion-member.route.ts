import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { DiscussionMembersRoutesTag } from "../discussions.constants";
import {
	getActiveMembership,
	requireGroupManager,
} from "../discussions.service";
import { DiscussionMemberParams } from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "delete",
	path: "/chat/remove-discussion-member/{discussionId}/{userId}",
	summary: "Leave a group or remove one of its members",
	tags: [DiscussionMembersRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: DiscussionMemberParams },
	responses: {
		[HttpStatus.OK.code]: { description: "Member removed" },
		[HttpStatus.FORBIDDEN.code]: { description: "Insufficient permissions" },
	},
});

const removeDiscussionMemberRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { discussionId, userId } = c.req.valid("param");
		const isLeaving = userId === authenticatedUserId;
		const actorMembership = isLeaving
			? await getActiveMembership(discussionId, authenticatedUserId)
			: await requireGroupManager(discussionId, authenticatedUserId);

		if (actorMembership.discussion.type !== "GROUP") {
			throw new Exception({
				code: ExceptionCodes.member_cannot_leave_private_discussion,
				message: "Members cannot leave a private discussion",
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
		if (!isLeaving) {
			if (targetMembership.role === "OWNER") {
				throw new Exception({
					code: ExceptionCodes.group_owner_cannot_be_removed,
					message: "The group owner cannot be removed",
					status: HttpStatus.FORBIDDEN.code,
				});
			}
			if (
				targetMembership.role === "ADMIN" &&
				actorMembership.role !== "OWNER"
			) {
				throw new Exception({
					code: ExceptionCodes.owner_required_to_remove_admin,
					message: "Only the owner can remove an administrator",
					status: HttpStatus.FORBIDDEN.code,
				});
			}
		}

		await prisma.$transaction(async (tx) => {
			if (isLeaving && targetMembership.role === "OWNER") {
				const successor = await tx.discussionMember.findFirst({
					where: {
						discussionId,
						userId: { not: userId },
						hasLeft: false,
					},
					orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
					select: { discussionId: true, userId: true },
				});
				if (successor) {
					await tx.discussionMember.update({
						where: {
							discussionId_userId: {
								discussionId: successor.discussionId,
								userId: successor.userId,
							},
						},
						data: { role: "OWNER" },
					});
				}
			}

			await tx.discussionMember.update({
				where: { discussionId_userId: { discussionId, userId } },
				data: { hasLeft: true, isDeleted: true, isBlocked: false },
			});
		});
		return c.json({
			message: isLeaving
				? "Left discussion successfully"
				: "Discussion member removed successfully",
			userId,
		});
	},
});

export { removeDiscussionMemberRoute };
