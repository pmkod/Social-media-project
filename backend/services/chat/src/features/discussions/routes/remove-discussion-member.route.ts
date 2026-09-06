import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { HTTPException } from "hono/http-exception";
import { DiscussionMembersRoutesTag } from "../discussions.constants";
import {
	getActiveMembership,
	requireGroupManager,
} from "../discussions.service";
import { DiscussionMemberParams } from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "delete",
	path: "/discussions/{discussionId}/members/{userId}",
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
			throw new HTTPException(400, {
				message: "Members cannot leave a private discussion",
			});
		}
		const targetMembership = await prisma.discussionMember.findUnique({
			where: { discussionId_userId: { discussionId, userId } },
		});
		if (!targetMembership || targetMembership.hasLeft) {
			throw new HTTPException(404, { message: "Group member not found" });
		}
		if (!isLeaving) {
			if (targetMembership.role === "OWNER") {
				throw new HTTPException(403, {
					message: "The group owner cannot be removed",
				});
			}
			if (
				targetMembership.role === "ADMIN" &&
				actorMembership.role !== "OWNER"
			) {
				throw new HTTPException(403, {
					message: "Only the owner can remove an administrator",
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
					select: { id: true },
				});
				if (successor) {
					await tx.discussionMember.update({
						where: { id: successor.id },
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
