import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { HTTPException } from "hono/http-exception";
import { DiscussionsRoutesTag } from "../discussions.constants";
import { getActiveMembership } from "../discussions.service";
import { DiscussionIdParams } from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "delete",
	path: "/discussions/{discussionId}",
	summary: "Delete a group discussion",
	tags: [DiscussionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: DiscussionIdParams },
	responses: {
		[HttpStatus.OK.code]: { description: "Group deleted" },
		[HttpStatus.FORBIDDEN.code]: { description: "Owner role required" },
	},
});

const deleteDiscussionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");
		const { discussionId } = c.req.valid("param");
		const membership = await getActiveMembership(
			discussionId,
			authenticatedUserId,
		);
		if (membership.discussion.type !== "GROUP") {
			throw new HTTPException(400, {
				message: "Private discussions cannot be deleted globally",
			});
		}
		if (membership.role !== "OWNER") {
			throw new HTTPException(403, {
				message: "Only the group owner can delete this discussion",
			});
		}

		await prisma.discussion.update({
			where: { id: discussionId },
			data: { deletedAt: new Date() },
		});
		return c.json({ success: true });
	},
});

export { deleteDiscussionRoute };
