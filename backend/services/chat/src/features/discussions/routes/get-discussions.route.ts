import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { DiscussionsRoutesTag } from "../discussions.constants";
import {
	buildDiscussionResponses,
	discussionDetailsInclude,
} from "../discussions.service";

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
		const { limit, cursorActivityAt, cursorId } = c.req.valid("query");
		if (Boolean(cursorActivityAt) !== Boolean(cursorId)) {
			throw new Exception({
				message: "cursorActivityAt and cursorId must be provided together",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}
		const cursorDate = cursorActivityAt ? new Date(cursorActivityAt) : null;
		const hasCursor = cursorDate && cursorId;

		const discussions = await prisma.discussion.findMany({
			where: {
				deletedAt: null,
				members: {
					some: {
						userId: authenticatedUser.id,
						hasLeft: false,
						isDeleted: false,
					},
				},
				AND: [
					{
						OR: [
							{ isStarted: true },
							{ isStarted: false, creatorId: authenticatedUser.id },
						],
					},
					...(hasCursor
						? [
								{
									OR: [
										{ lastActivityAt: { lt: cursorDate } },
										{
											lastActivityAt: cursorDate,
											id: { lt: cursorId },
										},
									],
								},
							]
						: []),
				],
			},
			include: discussionDetailsInclude,
			orderBy: [{ lastActivityAt: "desc" }, { id: "desc" }],
			take: limit + 1,
		});

		const hasNextPage = discussions.length > limit;
		const pageDiscussions = hasNextPage
			? discussions.slice(0, limit)
			: discussions;
		const presentedDiscussions = await buildDiscussionResponses(
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
