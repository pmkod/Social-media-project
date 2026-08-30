import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
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

const routeDef = createRoute({
	method: "get",
	path: "/discussions",
	summary: "Get the authenticated user's discussions",
	tags: [DiscussionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			limit: z.coerce.number().int().min(1).max(50).optional().default(25),
			cursorActivityAt: z.string().datetime().optional(),
			cursorId: z.string().min(1).optional(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Cursor-paginated discussions" },
	},
});

const getDiscussionsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");
		const { limit, cursorActivityAt, cursorId } = c.req.valid("query");
		if (Boolean(cursorActivityAt) !== Boolean(cursorId)) {
			throw new HTTPException(400, {
				message: "cursorActivityAt and cursorId must be provided together",
			});
		}
		const cursorDate = cursorActivityAt ? new Date(cursorActivityAt) : null;
		const hasCursor = cursorDate && cursorId;

		const discussions = await prisma.discussion.findMany({
			where: {
				deletedAt: null,
				members: {
					some: { userId: authenticatedUser.id, leftAt: null },
				},
				...(hasCursor
					? {
							OR: [
								{ lastActivityAt: { lt: cursorDate } },
								{ lastActivityAt: cursorDate, id: { lt: cursorId } },
							],
						}
					: {}),
			},
			include: discussionDetailsInclude,
			orderBy: [{ lastActivityAt: "desc" }, { id: "desc" }],
			take: limit + 1,
		});

		const hasNextPage = discussions.length > limit;
		const pageDiscussions = hasNextPage
			? discussions.slice(0, limit)
			: discussions;
		const presentedDiscussions = await presentDiscussions(
			pageDiscussions,
			authenticatedUser.id,
		);
		const lastDiscussion = pageDiscussions.at(-1);

		return c.json({
			discussions: presentedDiscussions,
			pagination: {
				limit,
				hasNextPage,
				nextCursor:
					hasNextPage && lastDiscussion
						? {
								activityAt: lastDiscussion.lastActivityAt,
								id: lastDiscussion.id,
							}
						: null,
			},
		});
	},
});

export { getDiscussionsRoute };
