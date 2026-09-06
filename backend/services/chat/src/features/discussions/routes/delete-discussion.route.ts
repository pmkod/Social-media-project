import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { DiscussionsRoutesTag } from "../discussions.constants";
import { getActiveMembership } from "../discussions.service";
import { DiscussionIdParams } from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "delete",
	path: "/discussions/{discussionId}",
	summary: "Soft-delete a discussion for the authenticated member",
	tags: [DiscussionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: DiscussionIdParams },
	responses: {
		[HttpStatus.OK.code]: { description: "Discussion deleted for member" },
		[HttpStatus.NOT_FOUND.code]: { description: "Discussion not found" },
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
		await getActiveMembership(
			discussionId,
			authenticatedUserId,
		);

		await prisma.discussionMember.update({
			where: {
				discussionId_userId: {
					discussionId,
					userId: authenticatedUserId,
				},
			},
			data: { isDeleted: true },
		});
		return c.json({ message: "Discussion deleted successfully" });
	},
});

export { deleteDiscussionRoute };
