import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import type { Prisma } from "@/generated/prisma/client";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/users/me/blocked",
	summary: "Get users blocked by the authenticated user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("20"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Blocked users" },
	},
});

const getBlockedUsersRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");
		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 20, 1),
			50,
		);
		const cursorDate = query.cursorCreatedAt
			? new Date(query.cursorCreatedAt)
			: null;
		const hasValidCursor =
			cursorDate !== null &&
			!Number.isNaN(cursorDate.getTime()) &&
			query.cursorId;
		const cursorCondition: Prisma.BlockWhereInput | undefined = hasValidCursor
			? {
					OR: [
						{ createdAt: { lt: cursorDate } },
						{ createdAt: cursorDate, id: { lt: query.cursorId } },
					],
				}
			: undefined;

		const blocks = await prisma.block.findMany({
			where: {
				blockerId: authenticatedUser.id,
				blocked: { active: true },
				...cursorCondition,
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			select: {
				id: true,
				createdAt: true,
				blocked: {
					select: {
						id: true,
						username: true,
						fullName: true,
						displayName: true,
						bio: true,
						avatarUrl: true,
						followersCount: true,
						followingCount: true,
						createdAt: true,
					},
				},
			},
		});

		const hasNextPage = blocks.length > limit;
		const items = hasNextPage ? blocks.slice(0, limit) : blocks;
		const lastItem = items.at(-1);
		const reciprocalBlocks = await prisma.block.findMany({
			where: {
				blockerId: { in: items.map((item) => item.blocked.id) },
				blockedId: authenticatedUser.id,
			},
			select: { blockerId: true },
		});
		const reciprocalBlockerIds = new Set(
			reciprocalBlocks.map((block) => block.blockerId),
		);

		return c.json({
			users: items.map((item) => ({
				...item.blocked,
				isFollowedByAuthenticatedUser: false,
				isBlockedByAuthenticatedUser: true,
				hasBlockedAuthenticatedInUser: reciprocalBlockerIds.has(
					item.blocked.id,
				),
			})),
			pagination: {
				nextCursor:
					hasNextPage && lastItem
						? {
								id: lastItem.id,
								createdAt: lastItem.createdAt.toISOString(),
							}
						: null,
				hasNextPage,
				limit,
			},
		});
	},
});

export { getBlockedUsersRoute };
