import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { HTTPException } from "hono/http-exception";
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
		const authenticatedUserId = c.get("authenticatedUser")?.id;
		if (!authenticatedUserId) throw new Error("Unauthorized");
		const { discussionId, userId } = c.req.valid("param");
		const { role, isBlocked } = c.req.valid("json");
		const actorMembership = await getActiveMembership(
			discussionId,
			authenticatedUserId,
		);
		if (isBlocked !== undefined) {
			if (userId !== authenticatedUserId) {
				throw new HTTPException(403, {
					message: "Members can only change their own blocked state",
				});
			}
			const member = await prisma.discussionMember.update({
				where: { discussionId_userId: { discussionId, userId } },
				data: { isBlocked },
				select: { userId: true, role: true, joinedAt: true, isBlocked: true },
			});
			return c.json({ member });
		}

		if (!role) throw new Error("Member role missing");
		if (
			actorMembership.discussion.type !== "GROUP" ||
			actorMembership.role !== "OWNER"
		) {
			throw new HTTPException(403, {
				message: "Only the group owner can change member roles",
			});
		}
		if (userId === authenticatedUserId) {
			throw new HTTPException(400, {
				message: "The owner cannot change their own role",
			});
		}

		const targetMembership = await prisma.discussionMember.findUnique({
			where: { discussionId_userId: { discussionId, userId } },
		});
		if (!targetMembership || targetMembership.hasLeft) {
			throw new HTTPException(404, { message: "Group member not found" });
		}
		if (targetMembership.role === "OWNER") {
			throw new HTTPException(409, {
				message: "The owner role cannot be changed here",
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
