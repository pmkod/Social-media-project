import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { HTTPException } from "hono/http-exception";
import { DiscussionsRoutesTag } from "../discussions.constants";
import { getActiveMembership } from "../discussions.service";
import { DiscussionIdParams } from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/discussions/{discussionId}/media",
	summary: "Get media shared in a discussion",
	tags: [DiscussionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: DiscussionIdParams,
		query: z.object({
			limit: z.coerce.number().int().min(1).max(100).optional().default(30),
			cursorCreatedAt: z.string().datetime().optional(),
			cursorId: z.string().min(1).optional(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Cursor-paginated discussion media" },
		[HttpStatus.NOT_FOUND.code]: { description: "Discussion not found" },
	},
});

const getDiscussionMediaRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;
		const { discussionId } = c.req.valid("param");
		const { limit, cursorCreatedAt, cursorId } = c.req.valid("query");
		await getActiveMembership(discussionId, authenticatedUserId);

		if (Boolean(cursorCreatedAt) !== Boolean(cursorId)) {
			throw new HTTPException(400, {
				message: "cursorCreatedAt and cursorId must be provided together",
			});
		}
		const cursorDate = cursorCreatedAt ? new Date(cursorCreatedAt) : null;
		const media = await prisma.messageMedia.findMany({
			where: {
				message: { discussionId, deletedAt: null },
				...(cursorDate && cursorId
					? {
							OR: [
								{ createdAt: { lt: cursorDate } },
								{ createdAt: cursorDate, id: { lt: cursorId } },
							],
						}
					: {}),
			},
			select: {
				id: true,
				type: true,
				url: true,
				fileName: true,
				mimeType: true,
				width: true,
				height: true,
				createdAt: true,
				message: {
					select: { id: true, senderId: true, content: true, createdAt: true },
				},
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
		});

		const hasNextPage = media.length > limit;
		const pageMedia = hasNextPage ? media.slice(0, limit) : media;
		const lastMedia = pageMedia.at(-1);

		return c.json({
			media: pageMedia,
			pagination: {
				limit,
				hasNextPage,
				nextCursor:
					hasNextPage && lastMedia
						? { createdAt: lastMedia.createdAt, id: lastMedia.id }
						: null,
			},
		});
	},
});

export { getDiscussionMediaRoute };
