import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { HTTPException } from "hono/http-exception";
import { DiscussionsRoutesTag } from "../discussions.constants";
import {
	discussionDetailsInclude,
	presentDiscussions,
} from "../discussions.presenter";
import { getActiveMembership } from "../discussions.service";
import { DiscussionIdParams } from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/discussions/{discussionId}",
	summary: "Get one discussion",
	tags: [DiscussionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: DiscussionIdParams },
	responses: {
		[HttpStatus.OK.code]: { description: "Discussion details" },
		[HttpStatus.NOT_FOUND.code]: { description: "Discussion not found" },
	},
});

const getDiscussionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser")?.id;
		if (!authenticatedUserId) throw new Error("Unauthorized");
		const { discussionId } = c.req.valid("param");
		await getActiveMembership(discussionId, authenticatedUserId);

		const discussion = await prisma.discussion.findUnique({
			where: { id: discussionId },
			include: discussionDetailsInclude,
		});
		if (!discussion) {
			throw new HTTPException(404, { message: "Discussion not found" });
		}

		const [presentedDiscussion] = await presentDiscussions(
			[discussion],
			authenticatedUserId,
		);
		return c.json({ discussion: presentedDiscussion });
	},
});

export { getDiscussionRoute };
