import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { DiscussionsRoutesTag } from "../discussions.constants";
import {
	discussionDetailsInclude,
	presentDiscussions,
} from "../discussions.presenter";
import { requireGroupManager } from "../discussions.service";
import {
	DiscussionIdParams,
	UpdateDiscussionRequestBody,
} from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "patch",
	path: "/discussions/{discussionId}",
	summary: "Update a group discussion",
	tags: [DiscussionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: DiscussionIdParams,
		body: {
			content: {
				"application/json": { schema: UpdateDiscussionRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Group updated" },
		[HttpStatus.FORBIDDEN.code]: { description: "Manager role required" },
	},
});

const updateDiscussionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { discussionId } = c.req.valid("param");
		const data = c.req.valid("json");
		await requireGroupManager(discussionId, authenticatedUserId);

		const discussion = await prisma.discussion.update({
			where: { id: discussionId },
			data: {
				...(data.name !== undefined ? { name: data.name } : {}),
				...(data.description !== undefined
					? { description: data.description || null }
					: {}),
			},
			include: discussionDetailsInclude,
		});
		const [presentedDiscussion] = await presentDiscussions(
			[discussion],
			authenticatedUserId,
		);
		return c.json({ discussion: presentedDiscussion });
	},
});

export { updateDiscussionRoute };
